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
    <path d="M11.83,9L15,12.17C14.83,12.58 14.5,12.58 14.17,12.17L11.83,9M12,4.5C7,4.5 2.73,7.61 1,12C1.6,13.54 2.6,14.85 3.82,15.91L5.27,14.46C4.47,13.73 3.83,12.92 3.33,12C4.83,9.27 8.21,7.5 12,7.5C13.25,7.5 14.44,7.77 15.5,8.23L17.2,6.53C15.6,5.23 13.9,4.5 12,4.5M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C14.54,19.5 16.88,18.78 18.8,17.58L19.3,18.08L21,19.78L22.27,18.5L3.27,3L2,4.27M7.53,9.8L9.08,11.35C9.03,11.57 9,11.78 9,12C9,13.66 10.34,15 12,15C12.22,15 12.43,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17C9.24,17 7,14.76 7,12C7,11.21 7.2,10.47 7.53,9.8M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" fill="currentColor"/>
  </svg>
)
