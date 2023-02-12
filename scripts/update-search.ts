import { execSync } from 'child_process'
import { load } from 'cheerio'
import fs from 'fs'
import path from 'node:path'

const tmpDir = fs.mkdtempSync('firefox-ios-')
execSync(`git clone https://ghproxy.com/github.com/mozilla-mobile/firefox-ios --depth 1 ${tmpDir}`)
console.log('Cloned!\nProcessing...')
const pluginDir = path.join(tmpDir, 'Client/Assets/Search/SearchPlugins')
const results: Record<string, string> = {}

fs.readdirSync(pluginDir).forEach((filename) => {
  if (!filename.endsWith('.xml')) return
  const content = fs.readFileSync(path.join(pluginDir, filename))
  const $ = load(content, { xml: true })
  const urlElement = $('Url[type="text/html"]')
  const templateUrl = urlElement.attr()?.template
  if (templateUrl === undefined) return
  const param = urlElement.children('Param[value="{searchTerms}"]')
  const paramName = param.attr()?.name
  if (paramName === undefined) return
  const url = new URL(templateUrl)
  url.searchParams.set(paramName, 'searchTerms')
  // `{}` will be escaped, but we don't want that
  results[url.hostname] = url.href.replace('searchTerms', '{searchTerms}')
  // Also add non-www
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.slice(4)
    results[url.hostname] = url.href.replace('searchTerms', '{searchTerms}')
  }
})

const outputFile = path.join(__dirname, '../faview/known-searches.json')
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2))
fs.rmSync(tmpDir, { recursive: true, force: true })
console.log('Done!')
