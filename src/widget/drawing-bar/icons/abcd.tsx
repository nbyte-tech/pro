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
    <path d="M3,12L7,8L12,13L17,8L21,12" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="7" cy="8" r="1.5" fill="currentColor"/><circle cx="12" cy="13" r="1.5" fill="currentColor"/><circle cx="17" cy="8" r="1.5" fill="currentColor"/><circle cx="21" cy="12" r="1.5" fill="currentColor"/>
  </svg>
)
