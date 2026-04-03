/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from 'solid-js'

export interface LogoProps {
  class?: string
  style?: any
  opacity?: number
  onClick?: () => void
}

const Logo: Component<LogoProps> = props => {
  return (
    <svg
      class={props.class}
      style={props.style}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={props.onClick}
    >
      <defs>
        <linearGradient id="strokeGlow" x1="30" y1="160" x2="170" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#2563FF" />
          <stop offset="100%" stop-color="#7FEFFF" />
        </linearGradient>
        <linearGradient id="fillTop" x1="45" y1="95" x2="155" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#0B63F6" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#7FEFFF" stop-opacity="0.18" />
        </linearGradient>
        <linearGradient id="fillMid" x1="40" y1="125" x2="160" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#0B63F6" stop-opacity="0.26" />
          <stop offset="100%" stop-color="#7FEFFF" stop-opacity="0.14" />
        </linearGradient>
        <linearGradient id="fillBottom" x1="35" y1="170" x2="165" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#0B63F6" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#7FEFFF" stop-opacity="0.12" />
        </linearGradient>
      </defs>
      <g opacity={props.opacity ?? 1}>
        <polygon points="100,102 174,140 100,178 26,140" fill="url(#fillBottom)" stroke="url(#strokeGlow)" stroke-width="4" stroke-linejoin="round" />
        <polygon points="100,66 174,104 100,142 26,104" fill="url(#fillMid)" stroke="url(#strokeGlow)" stroke-width="4" stroke-linejoin="round" />
        <polygon points="100,30 174,68 100,106 26,68" fill="url(#fillTop)" stroke="url(#strokeGlow)" stroke-width="4" stroke-linejoin="round" />
      </g>
    </svg>
  )
}

export default Logo
