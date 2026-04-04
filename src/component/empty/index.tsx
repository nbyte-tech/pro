/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { VoidComponent } from 'solid-js'

const Empty: VoidComponent = () => {
  return (
    <div
      class="klinecharts-pro-empty">
      <svg
        class="icon"
        viewBox="0 0 24 24">
        <path d="M20,6H12L10,4H4C2.89,4 2.01,4.89 2.01,6L2,18C2,19.11 2.89,20 4,20H20C21.11,20 22,19.11 22,18V8C22,6.89 21.11,6 20,6M20,18H4V8H20V18Z" fill="currentColor"/>
      </svg>
    </div>
  )
}

export default Empty
