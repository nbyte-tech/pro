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
    <path d="M2,11H22V13H2V11Z" fill="currentColor"/><path d="M12,7L16,11H14V17H10V11H8L12,7Z" fill="currentColor"/>
  </svg>
)
