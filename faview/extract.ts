import type { CheerioAPI, Element } from 'cheerio'

const selectors = [
  "link[rel='icon']",
  "link[rel='shortcut icon']",
  "link[rel='apple-touch-icon']",
  "link[rel='apple-touch-icon-precomposed']",
  "link[rel='apple-touch-startup-image']",
  "link[rel='mask-icon']",
  "link[rel='fluid-icon']"
]

export interface Icon {
  src: string
  type?: string
  sizes?: string
}

export const extractIcons = ($: CheerioAPI): Icon[] => {
  const icons: Icon[] = []

  selectors.forEach((selector) => {
    $(selector).each((i, elem) => {
      const attrs = (elem as Element).attribs
      const { href, sizes, type } = attrs
      if (href && href !== '#') {
        icons.push({ sizes, src: href, type })
      }
    })
  })

  return icons
}

export const extractTitle = ($: CheerioAPI): string => {
  return $('title').text()
}

export const extractSearch = ($: CheerioAPI): string | null => {
  const searchLink = $("link[rel='search']")
  return searchLink.attr()?.href ?? null
}

export const extractSearchTemplate = ($: CheerioAPI): string | null => {
  return $("Url[type='text/html']").attr()?.template ?? null
}
