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

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const { domain, useSecure } = request.query
  if (Array.isArray(domain)) {
    return response.status(400).json({
      error: 'need exactly 1 domains'
    })
  }
  const url = `${useSecure === 'false' ? 'http' : 'https'}://${domain}/`
  const document = await fetchDocument(url)
  if (document === null) {
    return response.status(504).json({
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

  response.status(200).json(previewInfo)
}
