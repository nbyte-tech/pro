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

import { Component, createSignal, Show } from 'solid-js'

import { utils } from 'klinecharts'

import { Modal, Input, Select, Color } from '../../component'
import type { SelectDataSourceItem } from '../../component'
import lodashSet from 'lodash/set'
import lodashGet from 'lodash/get'

import i18n from '../../i18n'

import data from './data'

export interface IndicatorSettingModalProps {
  locale: string
  params: { indicatorName: string, paneId: string, calcParams: any[], styles: any }
  defaultStyles?: any
  onClose: () => void
  onConfirm: (params: { calcParams: any[], styles: any }) => void
  onChange?: (params: { calcParams: any[], styles: any }) => void
}

const IndicatorSettingModal: Component<IndicatorSettingModalProps> = props => {
  const [calcParams, setCalcParams] = createSignal(utils.clone(props.params.calcParams))
  const [styles, setStyles] = createSignal(utils.clone(props.params.styles || {}))
  const [activeTab, setActiveTab] = createSignal('params')

  const getConfig: (name: string) => any[] = (name: string) => {
    // @ts-expect-error
    return data[name]
  }

  const getParams = (p: any[]) => {
    const config = getConfig(props.params.indicatorName)
    const params: any[] = []
    utils.clone(p).forEach((param: any, i: number) => {
      if (!utils.isValid(param) || param === '') {
        if (config[i] && 'default' in config[i]) {
          params.push(config[i]['default'])
        }
      } else {
        params.push(param)
      }
    })
    return params
  }

  const handleParamsChange = (params: any[]) => {
    setCalcParams(params)
    props.onChange?.({ calcParams: getParams(params), styles: styles() })
  }

  const handleStylesChange = (ss: any) => {
    setStyles(ss)
    props.onChange?.({ calcParams: getParams(calcParams()), styles: ss })
  }

  return (
    <Modal
      title={props.params.indicatorName}
      width={600}
      buttons={[
        {
          type: 'confirm',
          children: i18n('confirm', props.locale),
          onClick: () => {
            props.onConfirm({ calcParams: getParams(calcParams()), styles: styles() })
            props.onClose()
          }
        }
      ]}
      onClose={props.onClose}>
      <div class="klinecharts-pro-indicator-setting-modal-content">
        <div class="tabs">
          <span
            class={activeTab() === 'params' ? 'active' : ''}
            onClick={() => setActiveTab('params')}>
            {i18n('parameters', props.locale)}
          </span>
          <span
            class={activeTab() === 'styles' ? 'active' : ''}
            onClick={() => setActiveTab('styles')}>
            {i18n('styles', props.locale)}
          </span>
        </div>
        <Show when={activeTab() === 'params'}>
          {
            getConfig(props.params.indicatorName).map((d, i) => {
              let component
              if (d.type === 'select') {
                const selectedItem = d.dataSource.find((item: any) => item.key == calcParams()[i]) || d.dataSource[0]
                component = (
                  <Select
                    style={{ width: '200px' }}
                    value={i18n(selectedItem.text, props.locale)}
                    dataSource={d.dataSource.map((item: any) => ({ ...item, text: i18n(item.text, props.locale) }))}
                    onSelected={item => {
                      const params = utils.clone(calcParams())
                      const value = typeof item === 'object' ? item.key : item
                      const num = parseFloat(value as string)
                      params[i] = isNaN(num) ? value : num
                      handleParamsChange(params)
                    }}/>
                )
              } else {
                component = (
                  <Input
                    style={{ width: '200px' }}
                    value={calcParams()[i] ?? ''}
                    precision={d.precision}
                    min={d.min}
                    onChange={value => {
                      const params = utils.clone(calcParams())
                      params[i] = value
                      handleParamsChange(params)
                    }}/>
                )
              }
              return (
                <div class="item">
                  <span >{i18n(d.paramNameKey, props.locale)}</span>
                  {component}
                </div>
              )
            })
          }
        </Show>
        <Show when={activeTab() === 'styles'}>
          {
            getConfig(props.params.indicatorName).filter(d => !!d.styleKey).map((d) => {
              const styleKey = d.styleKey!
              const colorKey = styleKey
              const sizeKey = styleKey.replace('color', 'size')
              const typeKey = styleKey.replace('color', 'style')
              const color = lodashGet(styles(), colorKey) ?? lodashGet(props.defaultStyles, colorKey) ?? '#2196F3'
              const size = lodashGet(styles(), sizeKey) ?? lodashGet(props.defaultStyles, sizeKey) ?? 1
              const type = lodashGet(styles(), typeKey) ?? lodashGet(props.defaultStyles, typeKey) ?? 'solid'
              return (
                <div class="item">
                  <span >{i18n(d.paramNameKey, props.locale)}</span>
                  <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                    <Color
                      value={color as string}
                      onChange={c => {
                        const ss = utils.clone(styles())
                        lodashSet(ss, colorKey, c)
                        handleStylesChange(ss)
                      }}/>
                    <Select
                      style={{ width: '80px' }}
                      value={size as string}
                      dataSource={[1, 2, 3, 4, 5].map(s => ({ key: s.toString(), text: s.toString() }))}
                      onSelected={s => {
                        const ss = utils.clone(styles())
                        const v = typeof s === 'object' ? s.key : s
                        lodashSet(ss, sizeKey, parseInt(v as string, 10))
                        handleStylesChange(ss)
                      }}/>
                    <Select
                      style={{ width: '100px' }}
                      value={i18n(type as string, props.locale)}
                      dataSource={[
                        { key: 'solid', text: i18n('solid', props.locale) },
                        { key: 'dashed', text: i18n('dashed', props.locale) }
                      ]}
                      onSelected={t => {
                        const ss = utils.clone(styles())
                        const v = typeof t === 'object' ? t.key : t
                        lodashSet(ss, typeKey, v)
                        handleStylesChange(ss)
                      }}/>
                  </div>
                </div>
              )
            })
          }
        </Show>
      </div>
      
    </Modal>
  )
}

export default IndicatorSettingModal
