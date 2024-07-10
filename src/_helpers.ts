/*!
This file is part of CycloneDX generator for NPM projects.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
Copyright (c) OWASP Foundation. All Rights Reserved.
*/

import { readFileSync, writeSync } from 'fs'

export function loadJsonFile (path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'))
  // may be replaced by `require(f, { with: { type: "json" } })`
  // as soon as this spec is properly implemented.
  // see https://github.com/tc39/proposal-import-attributes
}

export async function writeAllSync (fd: number, data: string): Promise<number> {
  const b = Buffer.from(data)
  const l = b.byteLength
  let w = 0
  while (w < l) {
    try {
      w += writeSync(fd, b, w)
    } catch (error: any) {
      if (error.code !== 'EAGAIN') {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
  return w
}

export function isString (v: any): v is string {
  return typeof v === 'string'
}

export function tryRemoveSecretsFromUrl (url: string): string {
  try {
    const u = new URL(url)
    u.password = ''
    return u.toString()
  } catch {
    return url
  }
}

/* eslint-disable-next-line @typescript-eslint/naming-convention */
const _urlCanParse_polyfill: (url: string) => boolean = typeof URL.canParse === 'function'
  ? URL.canParse.bind(URL)
  : (url: string) => {
      try {
        /* eslint-disable-next-line no-new */
        new URL(url)
      } catch { return false }
      return true
    }

// region trySanitizeGitUrl

const _sshGitUrlRE = /^(?<user>[^@:]+@)(?<host>[^:]+):(?<path>.*)$/
interface _sshGitUrlRE_groups {
  user?: string
  host: string
  path: string
}

export function trySanitizeGitUrl (gitUrl: string): string {
  if (_urlCanParse_polyfill(gitUrl)) {
    return gitUrl
  }

  const sshGs = _sshGitUrlRE.exec(gitUrl)?.groups as _sshGitUrlRE_groups | undefined
  if (sshGs !== undefined) {
    return `git+ssh://${sshGs.user ?? ''}${sshGs.host}/${sshGs.path}`
  }

  return gitUrl
}

// endregion trySanitizeGitUrl
