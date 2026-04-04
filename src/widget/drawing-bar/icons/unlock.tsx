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

export default (className?: string) => (
  <svg class={`icon-overlay ${className ?? ''}`} viewBox="0 0 24 24">
    <path d="M18,10H16V8A4,4 0 0,0 12,4A4,4 0 0,0 8,8H6A6,6 0 0,1 12,2A6,6 0 0,1 18,8V10M18,10A2,2 0 0,1 20,12V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V12A2,2 0 0,1 6,10H18M12,14A2,2 0 0,0 10,16A2,2 0 0,0 12,18A2,2 0 0,0 14,16A2,2 0 0,0 12,14Z" fill="currentColor"/>
  </svg>
)
