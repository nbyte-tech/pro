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

import { Component, createSignal, createResource, Show } from 'solid-js'

import { Modal, List, Input } from '../../component'

import i18n from '../../i18n'

import { SymbolInfo, Datafeed } from '../../types'

export interface SymbolSearchModalProps {
  locale: string
  datafeed: Datafeed
  onSymbolSelected: (symbol: SymbolInfo) => void
  onClose: () => void
}

const SymbolSearchModal: Component<SymbolSearchModalProps> = props => {
  const [value, setValue] = createSignal('')

  const [symbolList] = createResource(value, props.datafeed.searchSymbols.bind(props.datafeed))

  return (
    <Modal
      title={i18n('symbol_search', props.locale)}
      width={460}
      onClose={props.onClose}>
      <Input
        class="klinecharts-pro-symbol-search-modal-input"
        placeholder={i18n('symbol_code', props.locale)}
        suffix={
          <svg viewBox="0 0 24 24">
            <path d="M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,6.5 0 0,0 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.5L20.5,19L15.5,14M9.5,14C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,5 14,7 14,9.5C14,12 12,14 9.5,14Z" fill="currentColor"/>
          </svg>
        }
        value={value()}
        onChange={v => {
          const va = `${v}`
          setValue(va)
        }}/>
      <List
        class="klinecharts-pro-symbol-search-modal-list"
        loading={symbolList.loading}
        dataSource={symbolList() ?? []}
        renderItem={(symbol: SymbolInfo) => (
          <li
            onClick={() => {
              props.onSymbolSelected(symbol)
              props.onClose()
            }}>
            <div>
              <Show when={symbol.logo}>
                <img alt="symbol" src={symbol.logo}/>
              </Show>
              <span title={symbol.name ?? ''}>{symbol.shortName ?? symbol.ticker}{`${symbol.name ? `(${symbol.name})` : ''}`}</span>
            </div>
            {symbol.exchange ?? ''}
          </li>
        )}>
      </List>
    </Modal>
  )
}

export default SymbolSearchModal
