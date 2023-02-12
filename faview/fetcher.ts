import { load } from 'cheerio'
import type { CheerioAPI } from 'cheerio'
import axios from 'axios'

export const fetcher = axios.create({
  headers: {
    Accept: '*/*',
    // prevent to redirect to the mobile version of a website
    'User-Agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36'
  },
  timeout: 4000
})

export const fetchDocument = async (url: string): Promise<null | CheerioAPI> => {
  try {
    const response = await fetcher.get(url)
    console.log(response.data)
    return load(response.data)
  } catch (e) {
    console.error(e)
    return null
  }
}

export const fetchOpenSearch = async (url: string): Promise<null | CheerioAPI> => {
  try {
    const response = await fetcher.get(url)
    return load(response.data, { xml: true })
  } catch {
    return null
  }
}
