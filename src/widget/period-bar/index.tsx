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

import { Component, Show, createSignal, onMount, onCleanup } from 'solid-js'

import { SymbolInfo, Period } from '../../types'

import i18n from '../../i18n'

import { Logo } from '../../component'

export interface PeriodBarProps {
  locale: string
  spread: boolean
  symbol: SymbolInfo
  symbolSearchVisible: boolean
  period: Period
  periods: Period[]
  onMenuClick: () => void
  onSymbolClick: () => void
  onPeriodChange: (period: Period) => void
  onIndicatorClick: () => void
  onScreenshotClick: () => void
}

const PeriodBar: Component<PeriodBarProps> = props => {
  let ref: Node

  const [fullScreen, setFullScreen] = createSignal(false)

  const fullScreenChange = () => {
    setFullScreen(full => !full)
  }

  onMount(() => {
    document.addEventListener('fullscreenchange', fullScreenChange)
    document.addEventListener('mozfullscreenchange', fullScreenChange)
    document.addEventListener('webkitfullscreenchange', fullScreenChange)
    document.addEventListener('msfullscreenchange', fullScreenChange)
  })

  onCleanup(() => {
    document.removeEventListener('fullscreenchange', fullScreenChange)
    document.removeEventListener('mozfullscreenchange', fullScreenChange)
    document.removeEventListener('webkitfullscreenchange', fullScreenChange)
    document.removeEventListener('msfullscreenchange', fullScreenChange)
  })

  return (
    <div
      ref={el => { ref = el }}
      class="klinecharts-pro-period-bar">
      <div class='menu-container'>
        <Logo
          class={props.spread ? '' : 'rotate'}
          onClick={props.onMenuClick}/>
      </div>
      <Show when={props.symbol}>
        <div
          class={`symbol ${props.symbolSearchVisible ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => {
            if (props.symbolSearchVisible) {
              props.onSymbolClick()
            }
          }}>
          <Show when={props.symbol.logo}>
            <img alt="symbol" src={props.symbol.logo}/>
          </Show>
          <span>{props.symbol.shortName ?? props.symbol.name ?? props.symbol.ticker}</span>
        </div>
      </Show>
      {
        props.periods.map(p => (
          <span
            class={`item period ${p.text === props.period.text ? 'selected' : ''}`}
            onClick={() => { props.onPeriodChange(p) }}>
            {p.text}
          </span>
        ))
      }
      <div
        class='item tools'
        onClick={props.onIndicatorClick}>
        <svg viewBox="0 0 24 24">
          <path d="M3.5,18.5L9.5,12.5L13.5,16.5L22,6.92L20.59,5.5L13.5,13.5L9.5,9.5L2,17L3.5,18.5Z" fill="currentColor"/>
        </svg>
        <span>{i18n('indicator', props.locale)}</span>
      </div>
      <div
        class='item tools screenshot'
        onClick={props.onScreenshotClick}>
        <svg viewBox="0 0 24 24">
          <path d="M12,12A3,3 0 0,0 9,15A3,3 0 0,0 12,18A3,3 0 0,0 15,15A3,3 0 0,0 12,12M22,15V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V10A2,2 0 0,1 4,8H7L9,6H15L17,8H20A2,2 0 0,1 22,10V12H20V10H16.12L14.12,8H9.88L7.88,10H4V18H20V15H22Z" fill="currentColor"/>
        </svg>
        <span>{i18n('screenshot', props.locale)}</span>
      </div>
      <div
        class='item tools full-screen'
        onClick={() => {
          if (!fullScreen()) {
            const el = ref?.parentElement
            if (el) {
              // @ts-expect-error
              const enterFullScreen = el.requestFullscreen ?? el.webkitRequestFullscreen ?? el.mozRequestFullScreen ?? el.msRequestFullscreen
              enterFullScreen.call(el)
              // setFullScreen(true)
            }
          } else {
            // @ts-expect-error
            const exitFullscreen = document.exitFullscreen ?? document.msExitFullscreen ?? document.mozCancelFullScreen ?? document.webkitExitFullscreen
            exitFullscreen.call(document)
            // setFullScreen(false)
          }
        }}>
        {
          fullScreen() ? (
            <>
              <svg viewBox="0 0 24 24">
                <path d="M14,14H19V16H16V19H14V14M5,14H10V19H8V16H5V14M8,5V8H5V10H10V5H8M16,5V8H19V10H14V5H16Z" fill="currentColor"/>
              </svg>
              <span>{i18n('exit_full_screen', props.locale)}</span>
            </>
            
          ) : (
            <>
              <svg viewBox="0 0 24 24">
                <path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,19H5V14H7V17H10V19Z" fill="currentColor"/>
              </svg>
              <span>{i18n('full_screen', props.locale)}</span>
            </>
          )
        }
      </div>
    </div>
  )
}

export default PeriodBar
