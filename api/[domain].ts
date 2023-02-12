import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  extractIcons,
  extractSearch,
  extractSearchTemplate,
  extractTitle,
  Icon
} from '../faview/extract'
import { fetchDocument, fetchOpenSearch } from '../faview/fetcher'

interface PreviewInfo {
  domain: string
  icons: Icon[]
  title: string
  search?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { domain, useSecure } = req.query
  if (Array.isArray(domain)) {
    return res.status(400).json({
      error: 'need exactly 1 domains'
    })
  }
  const url = `${useSecure === 'false' ? 'http' : 'https'}://${domain}/`
  const document = await fetchDocument(url)
  if (document === null) {
    return res.status(504).json({
      error: 'fail to fetch'
    })
  }
  const previewInfo: PreviewInfo = {
    domain,
    icons: extractIcons(document),
    title: extractTitle(document)
  }
  const searchXML = extractSearch(document)
  if (searchXML !== null) {
    const xmlURL = new URL(searchXML, url)
    const openSearchDocument = await fetchOpenSearch(xmlURL.href)
    if (openSearchDocument !== null) {
      const template = extractSearchTemplate(openSearchDocument)
      if (template !== null) {
        previewInfo.search = template
      }
    }
  }

  res.setHeader('Cache-Control', 's-maxage=8640000')
  res.status(200).json(previewInfo)
}
