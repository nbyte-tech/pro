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

import { createSignal, createEffect, onMount, Show, onCleanup, startTransition, Component, untrack } from 'solid-js'
import { render } from 'solid-js/web'

import {
  init, dispose, utils, Nullable, Chart, Overlay, OverlayMode, Styles, DeepPartial,
  TooltipIconPosition, ActionType, PaneOptions, Indicator, DomPosition, FormatDateType,
  IndicatorFigure
} from 'klinecharts'

import lodashSet from 'lodash/set'
import lodashClone from 'lodash/cloneDeep'
import lodashMerge from 'lodash/merge'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezonePlugin from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

import { SelectDataSourceItem, Loading } from './component'

import {
  PeriodBar, DrawingBar, IndicatorModal, SettingModal,
  ScreenshotModal, IndicatorSettingModal, SymbolSearchModal,
  DrawingToolbar
} from './widget'

import { translateTimezone } from './widget/setting-modal/data'
import indicatorConfigs from './widget/indicator-setting-modal/data'

import { SymbolInfo, Period, ChartProOptions, ChartPro, ChartConfig, IndicatorConfig } from './types'

export interface ChartProComponentProps extends Required<Omit<ChartProOptions, 'container' | 'onConfigChange'>> {
  ref: (chart: ChartPro) => void
  onConfigChange?: (config: ChartConfig) => void
}

interface IndicatorSettingModalParams {
  visible: boolean
  indicatorName: string
  paneId: string
  calcParams: any[]
  styles: any
}

interface PrevSymbolPeriod {
  symbol: SymbolInfo
  period: Period
}

function createIndicator (widget: Nullable<Chart>, indicator: string | IndicatorConfig, isStack?: boolean, paneOptions?: PaneOptions): Nullable<string> {
  const indicatorName = typeof indicator === 'string' ? indicator : indicator.name
  const indicatorParams = typeof indicator === 'string' ? undefined : indicator.calcParams
  if (indicatorName === 'VOL') {
    paneOptions = { gap: { bottom: 2 }, ...paneOptions }
  }
  // @ts-expect-error
  const config = indicatorConfigs[indicatorName]
  const calcParams = indicatorParams || config?.map((c: any) => c.default).filter((d: any) => d !== undefined)
  return widget?.createIndicator({
    name: indicatorName,
    calcParams: (calcParams && (calcParams.length > 0 || indicatorName === 'VOL')) ? calcParams : undefined,
    styles: typeof indicator !== 'string' ? indicator.styles : undefined,
    regenerateFigures: (indicatorName === 'VOL') ? (calcParams: any[]) => {
      return [
        {
          key: 'volume',
          title: 'VOLUME: ',
          type: 'bar',
          baseValue: 0,
          styles: (data: any, indicator: any, defaultStyles: any) => {
            const kLineData = data.current.kLineData
            if (kLineData) {
              let color = utils.formatValue(indicator.styles, 'bars[0].noChangeColor', defaultStyles.bars[0].noChangeColor) as string
              if (kLineData.close > kLineData.open) {
                color = utils.formatValue(indicator.styles, 'bars[0].upColor', defaultStyles.bars[0].upColor) as string
              } else if (kLineData.close < kLineData.open) {
                color = utils.formatValue(indicator.styles, 'bars[0].downColor', defaultStyles.bars[0].downColor) as string
              }
              return { color }
            }
            return {}
          }
        }
      ]
    } : undefined,
    // @ts-expect-error
    createTooltipDataSource: ({ indicator, defaultStyles }) => {
      const icons = getIndicatorTooltipIcons(defaultStyles.tooltip.text.color)
      const res = []
      const showSetting = !!config && config.length > 0
      if (indicator.visible) {
        res.push(icons[1])
      } else {
        res.push(icons[0])
      }
      if (showSetting) {
        res.push(icons[2])
      }
      res.push(icons[3])
      let calcParamsText = ''
      if (indicator.calcParams.length > 0) {
        let params = indicator.calcParams
        if (indicator.name === 'MACD' && params.length > 3) {
          params = params.slice(0, 3)
        }
        calcParamsText = `(${params.join(',')})`
      }
      return {
        name: indicator.shortName,
        calcParamsText,
        icons: res
      }
    }
  }, isStack, paneOptions) ?? null
}

const getIndicatorTooltipIcons = (color: string) => [
  {
    id: 'visible',
    position: TooltipIconPosition.Left,
    marginLeft: 8,
    marginTop: 7,
    marginRight: 0,
    marginBottom: 0,
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    icon: '\ue903',
    fontFamily: 'icomoon',
    size: 14,
    color: color,
    activeColor: color,
    backgroundColor: 'transparent',
    activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
  },
  {
    id: 'invisible',
    position: TooltipIconPosition.Left,
    marginLeft: 8,
    marginTop: 7,
    marginRight: 0,
    marginBottom: 0,
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    icon: '\ue901',
    fontFamily: 'icomoon',
    size: 14,
    color: color,
    activeColor: color,
    backgroundColor: 'transparent',
    activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
  },
  {
    id: 'setting',
    position: TooltipIconPosition.Left,
    marginLeft: 6,
    marginTop: 7,
    marginBottom: 0,
    marginRight: 0,
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    icon: '\ue902',
    fontFamily: 'icomoon',
    size: 14,
    color: color,
    activeColor: color,
    backgroundColor: 'transparent',
    activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
  },
  {
    id: 'close',
    position: TooltipIconPosition.Left,
    marginLeft: 6,
    marginTop: 7,
    marginRight: 0,
    marginBottom: 0,
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    icon: '\ue900',
    fontFamily: 'icomoon',
    size: 14,
    color: color,
    activeColor: color,
    backgroundColor: 'transparent',
    activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
  }
]

const ChartProComponent: Component<ChartProComponentProps> = props => {
  let widgetRef: HTMLDivElement | undefined = undefined
  const [widget, setWidget] = createSignal<Nullable<Chart>>(null)

  let priceUnitDom: HTMLElement

  const [loading, setLoading] = createSignal(false)
  const [theme, setTheme] = createSignal(props.theme)
  const [styles, setStyles] = createSignal<any>(props.styles)
  const [locale, setLocale] = createSignal(props.locale)

  const [symbol, setSymbol] = createSignal(props.symbol)
  const [period, setPeriod] = createSignal(props.period)
  const [indicatorModalVisible, setIndicatorModalVisible] = createSignal(false)
  const [mainIndicators, setMainIndicators] = createSignal<Array<string | IndicatorConfig>>([...(props.mainIndicators!)])
  const [subIndicators, setSubIndicators] = createSignal<Array<{ name: string, paneId: string }>>([])

  createEffect(() => {
    setMainIndicators([...(props.mainIndicators!)])
  })

  // Full reconciliation effect to ensure widget state matches props/signals
  createEffect(() => {
    const w = widget()
    const main = mainIndicators()
    if (w) {
      // Reconcile main indicators on candle_pane
      main.forEach(item => {
        const name = typeof item === 'string' ? item : item.name
        const params = typeof item === 'string' ? undefined : item.calcParams
        const styles = typeof item === 'string' ? undefined : item.styles
        const existing = w.getIndicatorByPaneId('candle_pane', name) as Indicator
        if (!existing) {
          createIndicator(w, item, true, { id: 'candle_pane' })
        } else {
          const paramsSame = !params || JSON.stringify(existing.calcParams) === JSON.stringify(params)
          const stylesSame = !styles || JSON.stringify(existing.styles) === JSON.stringify(styles)
          if (!paramsSame || !stylesSame) {
            w.overrideIndicator({ name, calcParams: params, styles }, 'candle_pane')
          }
        }
      })
      
      // Reconcile sub indicators
      const subs = props.subIndicators || []
      subs.forEach(item => {
        const name = typeof item === 'string' ? item : item.name
        const params = typeof item === 'string' ? undefined : item.calcParams
        const styles = typeof item === 'string' ? undefined : item.styles
        
        // Find if it exists in any non-candle pane
        let existingPaneId: string | undefined = undefined
        // @ts-expect-error
        w._panes.forEach(pane => {
          if (pane.getId() !== 'candle_pane' && w.getIndicatorByPaneId(pane.getId(), name)) {
            existingPaneId = pane.getId()
          }
        })
        
        if (!existingPaneId) {
          const paneId = createIndicator(w, item, true)
          if (paneId) {
            // @ts-ignore
            w.setPaneYAxisWheelListener?.(paneId)
            const newSubIndicators = [...subIndicators(), { name, paneId, calcParams: params, styles }]
            untrack(() => setSubIndicators(newSubIndicators))
          }
        } else {
          const existing = w.getIndicatorByPaneId(existingPaneId, name) as Indicator
          const paramsSame = !params || JSON.stringify(existing.calcParams) === JSON.stringify(params)
          const stylesSame = !styles || JSON.stringify(existing.styles) === JSON.stringify(styles)
          if (!paramsSame || !stylesSame) {
            w.overrideIndicator({ name, calcParams: params, styles }, existingPaneId)
          }
        }
      })

      // Reconcile overlays
      const overlays = props.overlays || []
      overlays.forEach(o => {
        const existing = w.getOverlayById(o.id!)
        if (!existing) {
          w.createOverlay({
            ...o,
            onSelected: (e) => {
              setSelectedOverlay(e.overlay)
              return true
            },
            onDeselected: (e) => {
              setSelectedOverlay(null)
              return true
            },
            onPressedMoveEnd: (e) => {
              setOverlayUpdateCount(overlayUpdateCount() + 1)
              return true
            },
            onDrawEnd: (e) => {
              setOverlayUpdateCount(overlayUpdateCount() + 1)
              return true
            },
            onRemoved: (e) => {
              setOverlayUpdateCount(overlayUpdateCount() + 1)
              return true
            }
          })
        }
      })
    }
  })

  const defaultTz = props.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const [timezone, setTimezone] = createSignal<SelectDataSourceItem>({ key: defaultTz, text: translateTimezone(defaultTz, props.locale) })

  const [settingModalVisible, setSettingModalVisible] = createSignal(false)
  const [widgetDefaultStyles, setWidgetDefaultStyles] = createSignal<any>({})

  const [screenshotUrl, setScreenshotUrl] = createSignal('')

  const [drawingBarVisible, setDrawingBarVisible] = createSignal(props.drawingBarVisible)

  createEffect(() => {
    setDrawingBarVisible(props.drawingBarVisible)
  })

  const [symbolSearchModalVisible, setSymbolSearchModalVisible] = createSignal(false)

  const [loadingVisible, setLoadingVisible] = createSignal(false)

  const [selectedOverlay, setSelectedOverlay] = createSignal<Nullable<Overlay>>(null)

  const [indicatorSettingModalParams, setIndicatorSettingModalParams] = createSignal<IndicatorSettingModalParams>({
    visible: false, indicatorName: '', paneId: '', calcParams: [], styles: {}
  })

  const [indicatorUpdateCount, setIndicatorUpdateCount] = createSignal(0)
  const [overlayUpdateCount, setOverlayUpdateCount] = createSignal(0)

  createEffect(() => {
    if (!widget()) return
    const config = {
      symbol: symbol(),
      period: period(),
      timezone: timezone().key,
      mainIndicators: mainIndicators().map(i => {
        const name = typeof i === 'string' ? i : i.name
        const indicator = widget()?.getIndicatorByPaneId('candle_pane', name) as Indicator
        return { name, calcParams: indicator?.calcParams, styles: indicator?.styles }
      }),
      subIndicators: subIndicators().map(item => {
        const indicator = widget()?.getIndicatorByPaneId(item.paneId, item.name) as Indicator
        return { name: item.name, calcParams: indicator?.calcParams, styles: indicator?.styles }
      }),
      overlays: (widget() as any)?._chartStore.getOverlayStore().getInstances().map((i: any) => ({
        name: i.name, id: i.id, points: i.points, styles: i.styles, lock: i.lock, visible: i.visible, mode: i.mode, extendData: i.extendData
      })) || [],
      styles: lodashMerge({}, widgetDefaultStyles(), styles()),
      theme: theme(),
      locale: locale()
    }
    indicatorUpdateCount()
    overlayUpdateCount()
    untrack(() => {
      props.onConfigChange?.(config as any)
    })
  })

  props.ref({
    setTheme,
    getTheme: () => theme(),
    setStyles: (s: DeepPartial<Styles>) => {
      widget()?.setStyles(s)
      if (widget()) {
        const newStyles = lodashClone(styles())
        lodashMerge(newStyles, s)
        setStyles(newStyles)
      }
    },
    getStyles: () => widget()!.getStyles(),
    setLocale,
    getLocale: () => locale(),
    setTimezone: (timezone: string) => { setTimezone({ key: timezone, text: translateTimezone(timezone, locale()) }) },
    getTimezone: () => timezone().key,
    setSymbol,
    getSymbol: () => symbol(),
    setPeriod,
    getPeriod: () => period(),
    resize: () => {
      widget()?.resize()
    },
    dispose: () => {
      if (widget()) {
        dispose(widget()!)
      }
    },
    extractChartConfigs: () => {
      return {
        symbol: symbol(),
        period: period(),
        timezone: timezone().key,
        mainIndicators: mainIndicators().map(i => {
          const name = typeof i === 'string' ? i : i.name
          const indicator = widget()?.getIndicatorByPaneId('candle_pane', name) as Indicator
          return { name, calcParams: indicator?.calcParams, styles: indicator?.styles }
        }),
        subIndicators: subIndicators().map(item => {
          const indicator = widget()?.getIndicatorByPaneId(item.paneId, item.name) as Indicator
          return { name: item.name, calcParams: indicator?.calcParams, styles: indicator?.styles }
        }),
        overlays: (widget() as any)?._chartStore.getOverlayStore().getInstances().map((i: any) => ({
          name: i.name, id: i.id, points: i.points, styles: i.styles, lock: i.lock, visible: i.visible, mode: i.mode, extendData: i.extendData
        })) || [],
        styles: lodashMerge({}, widgetDefaultStyles(), styles()),
        theme: theme(),
        locale: locale()
      }
    }
  })

  const adjustFromTo = (period: Period, toTimestamp: number, count: number) => {
    let to = toTimestamp
    let from = to
    switch (period.timespan) {
      case 'minute': {
        to = to - (to % (60 * 1000))
        from = to - count * period.multiplier * 60 * 1000
        break
      }
      case 'hour': {
        to = to - (to % (60 * 60 * 1000))
        from = to - count * period.multiplier * 60 * 60 * 1000
        break
      }
      case 'day': {
        to = to - (to % (60 * 60 * 1000))
        from = to - count * period.multiplier * 24 * 60 * 60 * 1000
        break
      }
      case 'week': {
        const date = new Date(to)
        const week = date.getDay()
        const dif = week === 0 ? 6 : week - 1
        to = to - dif * 60 * 60 * 24
        const newDate = new Date(to)
        to = new Date(`${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`).getTime()
        from = to - count * period.multiplier * 7 * 24 * 60 * 60 * 1000
        break
      }
      case 'month': {
        const date = new Date(to)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        to = new Date(`${year}-${month}-01`).getTime()
        from = to - count * period.multiplier * 30 * 24 * 60 * 60 * 1000
        const fromDate = new Date(from)
        from = new Date(`${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-01`).getTime()
        break
      }
      case 'year': {
        const date = new Date(to)
        const year = date.getFullYear()
        to = new Date(`${year}-01-01`).getTime()
        from = to - count * period.multiplier * 365 * 24 * 60 * 60 * 1000
        const fromDate = new Date(from)
        from = new Date(`${fromDate.getFullYear()}-01-01`).getTime()
        break
      }
    }
    return [from, to]
  }

  const isRegularSession = (timestamp: number) => {
    const nyTime = dayjs(timestamp).tz('America/New_York')
    const hour = nyTime.hour()
    const minute = nyTime.minute()
    const totalMinutes = hour * 60 + minute
    return totalMinutes >= 9 * 60 + 30 && totalMinutes < 16 * 60
  }

  const resetChart = () => {
    if (widget()) {
      widget()!.scrollToRealTime()
      // @ts-expect-error
      const pane = widget()!._panes.get('candle_pane')
      if (pane) {
        const yAxis = pane.getAxisComponent()
        yAxis.setAutoCalcTickFlag(true)
        // @ts-expect-error
        widget()!.adjustPaneViewport(false, true, true, true, true)
      }
    }
  }

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const w = widget()
        if (w) {
          // @ts-expect-error
          const instance = w._chartStore.getOverlayStore().getClickInstanceInfo().instance
          if (instance) {
            w.removeOverlay(instance.id)
          }
        }
      } else {
        const isMod = e.ctrlKey || e.metaKey
        const isAlt = e.altKey
        if (isMod || isAlt) {
          const code = e.code
          let overlayName = ''
          if (code === 'KeyH' && isAlt) {
            e.preventDefault()
            overlayName = 'horizontalStraightLine'
          } else if (code === 'KeyV' && isAlt) {
            e.preventDefault()
            overlayName = 'verticalStraightLine'
          } else if (code === 'KeyT') {
            e.preventDefault()
            overlayName = isAlt ? 'straightLine' : 'segment'
          } else if (code === 'KeyJ' && isAlt) {
            e.preventDefault()
            overlayName = 'rayLine'
          } else if (code === 'KeyF' && isAlt) {
            e.preventDefault()
            overlayName = 'fibonacciLine'
          } else if (code === 'KeyG' && isAlt) {
            e.preventDefault()
            overlayName = 'gannBox'
          } else if (code === 'KeyP' && isAlt) {
            e.preventDefault()
            overlayName = 'priceLine'
          } else if (code === 'KeyR' && isAlt) {
            e.preventDefault()
            resetChart()
          } else if (code === 'KeyC' && isMod) {
            // @ts-expect-error
            const instance = widget()?._chartStore.getOverlayStore().getClickInstanceInfo().instance
            if (instance) {
              widget()?.removeOverlay(instance.id)
            }
          }

          if (overlayName) {
            widget()?.createOverlay({ name: overlayName, groupId: 'drawing_tools' })
          }
        }
      }
    }
    window.addEventListener('keydown', handler)
    onCleanup(() => {
      window.removeEventListener('keydown', handler)
    })
    const initializedWidget = init(widgetRef!, {
      customApi: {
        formatDate: (dateTimeFormat: Intl.DateTimeFormat, timestamp, format: string, type: FormatDateType) => {
          const p = period()
          switch (p.timespan) {
            case 'minute': {
              if (type === FormatDateType.XAxis) {
                return utils.formatDate(dateTimeFormat, timestamp, 'HH:mm')
              }
              return utils.formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD HH:mm')
            }
            case 'hour': {
              if (type === FormatDateType.XAxis) {
                return utils.formatDate(dateTimeFormat, timestamp, 'MM-DD HH:mm')
              }
              return utils.formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD HH:mm')
            }
            case 'day':
            case 'week': return utils.formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD')
            case 'month': {
              if (type === FormatDateType.XAxis) {
                return utils.formatDate(dateTimeFormat, timestamp, 'YYYY-MM')
              }
              return utils.formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD')
            }
            case 'year': {
              if (type === FormatDateType.XAxis) {
                return utils.formatDate(dateTimeFormat, timestamp, 'YYYY')
              }
              return utils.formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD')
            }
          }
          return utils.formatDate(dateTimeFormat, timestamp, 'YYYY-MM-DD HH:mm')
        }
      }
    })

    if (initializedWidget) {
      const t = theme()
      initializedWidget.setStyles(t)
      const iconColor = t === 'dark' ? '#929AA5' : '#76808F'
      initializedWidget.setStyles({
        indicator: {
          tooltip: {
            icons: getIndicatorTooltipIcons(iconColor)
          }
        }
      })

      setWidget(initializedWidget)

      const watermarkContainer = initializedWidget.getDom('candle_pane', DomPosition.Main)
      if (watermarkContainer) {
        render(() => {
          const wm = props.watermark
          if (utils.isString(wm)) {
            return <div class="klinecharts-pro-watermark" innerHTML={wm as string}/>
          } else if (typeof wm === 'function') {
            return <div class="klinecharts-pro-watermark">{wm(symbol())}</div>
          } else {
            return <div class="klinecharts-pro-watermark">{wm as Node}</div>
          }
        }, watermarkContainer)
      }

      const setPaneYAxisWheelListener = (paneId: string) => {
        const container = initializedWidget.getDom(paneId, DomPosition.YAxis)
        if (container) {
          container.addEventListener('wheel', (e) => {
            e.preventDefault()
            e.stopPropagation()
            const rect = container.getBoundingClientRect()
            const delta = e.deltaY
            if (delta === 0) {
              return
            }
            const zoomFactor = Math.pow(0.95, -delta / 100)
            const mouseY = e.clientY - rect.top

            // @ts-expect-error
            const pane = initializedWidget!._panes.get(paneId)
            if (pane) {
              const yAxis = pane.getAxisComponent()
              const { min, max, range } = yAxis.getExtremum()
              const mouseAxisValue = (1 - mouseY / rect.height) * range + min
              const newTopAxisValue = mouseAxisValue + (max - mouseAxisValue) * zoomFactor
              const newBottomAxisValue = mouseAxisValue - (mouseAxisValue - min) * zoomFactor
              const newRange = newTopAxisValue - newBottomAxisValue

              yAxis.setExtremum({
                min: newBottomAxisValue,
                max: newTopAxisValue,
                range: newRange,
                realMin: yAxis.convertToRealValue(newBottomAxisValue),
                realMax: yAxis.convertToRealValue(newTopAxisValue),
                realRange: yAxis.convertToRealValue(newTopAxisValue) - yAxis.convertToRealValue(newBottomAxisValue)
              })
              // @ts-expect-error
              initializedWidget!.adjustPaneViewport(false, true, true, true, true)
            }
          }, { passive: false })

          container.addEventListener('dblclick', () => {
            // @ts-expect-error
            const pane = initializedWidget!._panes.get(paneId)
            if (pane) {
              const yAxis = pane.getAxisComponent()
              yAxis.setAutoCalcTickFlag(true)
              // @ts-expect-error
              initializedWidget!.adjustPaneViewport(false, true, true, true, true)
            }
          })
        }
      }
      
      // @ts-ignore
      initializedWidget.setPaneYAxisWheelListener = setPaneYAxisWheelListener

      const priceUnitContainer = initializedWidget.getDom('candle_pane', DomPosition.YAxis)
      priceUnitDom = document.createElement('span')
      priceUnitDom.className = 'klinecharts-pro-price-unit'
      priceUnitContainer?.appendChild(priceUnitDom)
      
      setPaneYAxisWheelListener('candle_pane')

      mainIndicators().forEach(indicator => {
        createIndicator(initializedWidget, indicator, true, { id: 'candle_pane' })
      })
      const subIndicatorList: Array<{ name: string, paneId: string }> = []
      props.subIndicators!.forEach(indicator => {
        const paneId = createIndicator(initializedWidget, indicator, true)
        if (paneId) {
          setPaneYAxisWheelListener(paneId)
          const name = typeof indicator === 'string' ? indicator : indicator.name
          subIndicatorList.push({ name, paneId })
        }
      })
      setSubIndicators(subIndicatorList)
      initializedWidget.loadMore(timestamp => {
        setLoading(true)
        const get = async () => {
          const p = period()
          const [to] = adjustFromTo(p, timestamp!, 1)
          const [from] = adjustFromTo(p, to, 500)
          const kLineDataList = await props.datafeed.getHistoryKLineData(symbol(), p, from, to)
          const showExtended = !!utils.formatValue(styles(), 'candle.extendedHours.show')
          const filteredData = (showExtended || (p.timespan !== 'minute' && p.timespan !== 'hour'))
            ? kLineDataList
            : kLineDataList.filter(d => isRegularSession(d.timestamp))
          initializedWidget.applyMoreData(filteredData, kLineDataList.length > 0)
          setLoading(false)
        }
        get()
      })
      initializedWidget.subscribeAction(ActionType.OnTooltipIconClick, (data) => {
        if (data.indicatorName) {
          switch (data.iconId) {
            case 'visible': {
              initializedWidget.overrideIndicator({ name: data.indicatorName, visible: true }, data.paneId)
              break
            }
            case 'invisible': {
              initializedWidget.overrideIndicator({ name: data.indicatorName, visible: false }, data.paneId)
              break
            }
            case 'setting': {
              const indicator = initializedWidget.getIndicatorByPaneId(data.paneId, data.indicatorName) as Indicator
              setIndicatorSettingModalParams({
                visible: true,
                indicatorName: data.indicatorName,
                paneId: data.paneId,
                calcParams: utils.clone(indicator.calcParams),
                styles: utils.clone(indicator.styles)
              })
              break
            }
            case 'remove':
            case 'close': {
              if (data.paneId === 'candle_pane') {
                const newMainIndicators = [...mainIndicators()]
                initializedWidget.removeIndicator('candle_pane', data.indicatorName)
                const index = newMainIndicators.findIndex(i => (typeof i === 'string' ? i : i.name) === data.indicatorName)
                if (index > -1) {
                  newMainIndicators.splice(index, 1)
                }
                setMainIndicators(newMainIndicators)
              } else {
                const newIndicators = [...subIndicators()]
                initializedWidget.removeIndicator(data.paneId, data.indicatorName)
                const index = newIndicators.findIndex(i => i.name === data.indicatorName && i.paneId === data.paneId)
                if (index > -1) {
                  newIndicators.splice(index, 1)
                }
                setSubIndicators(newIndicators)
              }
            }
          }
        }
        if (widgetRef) {
          const reset = () => {
            const children = (widgetRef as HTMLElement).querySelectorAll('div')
            Array.from(children).forEach(child => {
              (child as HTMLElement).style.cursor = 'auto'
            })
            ;(widgetRef as HTMLElement).style.cursor = 'auto'
          }
          reset()
          setTimeout(reset, 50)
        }
      })
    }

    const resizeObserver = new ResizeObserver(() => {
      initializedWidget?.resize()
    })
    resizeObserver.observe(widgetRef!)
    onCleanup(() => {
      resizeObserver.disconnect()
    })
  })

  onCleanup(() => {
    dispose(widgetRef!)
  })

  createEffect(() => {
    const s = symbol()
    if (s?.priceCurrency) {
      priceUnitDom.innerHTML = s?.priceCurrency.toLocaleUpperCase()
      priceUnitDom.style.display = 'flex'
    } else {
      priceUnitDom.style.display = 'none'
    }
    widget()?.setPriceVolumePrecision(s?.pricePrecision ?? 2, s?.volumePrecision ?? 0)
  })

  createEffect((prev?: PrevSymbolPeriod) => {
    const s = symbol()
    const p = period()
    const isFetching = loading()
    if (isFetching) {
      return prev
    }
    if (prev && prev.symbol.ticker === s.ticker && prev.period.text === p.text) {
      return prev
    }
    if (prev) {
      props.datafeed.unsubscribe(prev.symbol, prev.period)
    }
    setLoading(true)
    setLoadingVisible(true)
    const get = async () => {
      const [from, to] = adjustFromTo(p, new Date().getTime(), 500)
      const kLineDataList = await props.datafeed.getHistoryKLineData(s, p, from, to)
      const showExtended = !!utils.formatValue(styles(), 'candle.extendedHours.show')
      const filteredData = (showExtended || (p.timespan !== 'minute' && p.timespan !== 'hour'))
        ? kLineDataList
        : kLineDataList.filter(d => isRegularSession(d.timestamp))
      widget()?.applyNewData(filteredData, kLineDataList.length > 0)
      props.datafeed.subscribe(s, p, data => {
        const showExtended = !!utils.formatValue(styles(), 'candle.extendedHours.show')
        if (showExtended || (p.timespan !== 'minute' && p.timespan !== 'hour') || isRegularSession(data.timestamp)) {
          widget()?.updateData(data)
        }
      })
      setLoading(false)
      setLoadingVisible(false)
    }
    get()
    return { symbol: s, period: p }
  })

  createEffect(() => {
    const t = theme()
    const w = widget()
    if (w) {
      w.setStyles(t)
      const color = t === 'dark' ? '#929AA5' : '#76808F'
      w.setStyles({
        indicator: {
          tooltip: {
            icons: getIndicatorTooltipIcons(color)
          }
        }
      })
      const themeStyles = w.getStyles()
      setWidgetDefaultStyles(lodashClone(themeStyles))
    }
  })

  createEffect(() => {
    widget()?.setLocale(locale())
  })

  createEffect(() => {
    widget()?.setTimezone(timezone().key)
  })

  createEffect(() => {
    const w = widget()
    const s = styles()
    const p = period()
    if (s && w) {
      const showHighlight = !!utils.formatValue(s, 'candle.extendedHours.show') && (p.timespan === 'minute' || p.timespan === 'hour')

      if (showHighlight) {
        if (!w.getIndicatorByPaneId('candle_pane', 'EXTENDED_HOURS_HIGHLIGHT')) {
          w.createIndicator('EXTENDED_HOURS_HIGHLIGHT', true, { id: 'candle_pane' })
        }
      } else {
        w.removeIndicator('candle_pane', 'EXTENDED_HOURS_HIGHLIGHT')
      }
    }
  })

  createEffect(() => {
    const w = widget()
    const s = styles()
    if (w && s) {
      widgetDefaultStyles()
      w.setStyles(s)
    }
  })

  return (
    <>
      <i class="icon-close klinecharts-pro-load-icon"/>
      <Show when={symbolSearchModalVisible()}>
        <SymbolSearchModal
          locale={props.locale}
          datafeed={props.datafeed}
          onSymbolSelected={symbol => { setSymbol(symbol) }}
          onClose={() => { setSymbolSearchModalVisible(false) }}/>
      </Show>
      <Show when={indicatorModalVisible()}>
        <IndicatorModal
          locale={props.locale}
          mainIndicators={mainIndicators().map(i => typeof i === 'string' ? i : i.name)}
          subIndicators={subIndicators()}
          onClose={() => { setIndicatorModalVisible(false) }}
          onMainIndicatorChange={data => {
            const newMainIndicators = [...mainIndicators()]
            if (data.added) {
              createIndicator(widget(), data.name, true, { id: 'candle_pane' })
              newMainIndicators.push(data.name)
            } else {
              const name = data.name
              widget()?.removeIndicator('candle_pane', name)
              const index = newMainIndicators.findIndex(i => (typeof i === 'string' ? i : i.name) === name)
              if (index > -1) {
                newMainIndicators.splice(index, 1)
              }
            }
            setMainIndicators(newMainIndicators)
          }}
          onSubIndicatorChange={data => {
            if (data.added) {
              const paneId = createIndicator(widget(), data.name)
              if (paneId) {
                // @ts-ignore
                widget()?.setPaneYAxisWheelListener?.(paneId)
                setSubIndicators([...subIndicators(), { name: data.name, paneId }])
              }
            } else {
              if (data.paneId) {
                widget()?.removeIndicator(data.paneId, data.name)
                const newSubIndicators = subIndicators().filter(i => i.name !== data.name || i.paneId !== data.paneId)
                setSubIndicators(newSubIndicators)
              }
            }
            setIndicatorUpdateCount(indicatorUpdateCount() + 1)
          }}/>
      </Show>
      <Show when={settingModalVisible()}>
        <SettingModal
          locale={props.locale}
          currentStyles={lodashMerge({}, widgetDefaultStyles(), styles()) as any}
          timezone={timezone()}
          onClose={() => { setSettingModalVisible(false) }}
          onTimezoneChange={setTimezone}
          onChange={style => {
            widget()?.setStyles(style)
            const newStyles = lodashClone(styles())
            lodashMerge(newStyles, style)
            setStyles(newStyles)
          }}
          onRestoreDefault={(options: SelectDataSourceItem[]) => {
            const style = {}
            options.forEach(option => {
              const key = option.key
              lodashSet(style, key, utils.formatValue(widgetDefaultStyles(), key))
            })
            widget()?.setStyles(style)
            const newStyles = lodashClone(styles())
            lodashMerge(newStyles, style)
            setStyles(newStyles)
          }}
        />
      </Show>
      <Show when={screenshotUrl().length > 0}>
        <ScreenshotModal
          locale={props.locale}
          url={screenshotUrl()}
          onClose={() => { setScreenshotUrl('') }}
        />
      </Show>
      <Show when={indicatorSettingModalParams().visible}>
        <IndicatorSettingModal
          locale={props.locale}
          params={indicatorSettingModalParams()}
          defaultStyles={widgetDefaultStyles().indicator}
          onClose={() => {
            const modalParams = indicatorSettingModalParams()
            if (modalParams.visible) {
              widget()?.overrideIndicator({
                name: modalParams.indicatorName,
                calcParams: modalParams.calcParams,
                styles: modalParams.styles
              }, modalParams.paneId)
            }
            setIndicatorSettingModalParams({ visible: false, indicatorName: '', paneId: '', calcParams: [], styles: {} })
          }}
          onChange={({ calcParams, styles }) => {
            const modalParams = indicatorSettingModalParams()
            widget()?.overrideIndicator({ name: modalParams.indicatorName, calcParams, styles }, modalParams.paneId)
          }}
          onConfirm={({ calcParams, styles })=> {
            const modalParams = indicatorSettingModalParams()
            widget()?.overrideIndicator({ name: modalParams.indicatorName, calcParams, styles }, modalParams.paneId)
            
            // Sync internal signals to ensure configs are remembered in state
            if (modalParams.paneId === 'candle_pane') {
              const newMainIndicators = mainIndicators().map(i => {
                const name = typeof i === 'string' ? i : i.name
                if (name === modalParams.indicatorName) {
                  return { name, calcParams, styles }
                }
                return i
              })
              setMainIndicators(newMainIndicators)
            } else {
              const newSubIndicators = subIndicators().map(i => {
                if (i.paneId === modalParams.paneId && i.name === modalParams.indicatorName) {
                  return { ...i, calcParams, styles }
                }
                return i
              })
              setSubIndicators(newSubIndicators)
            }
            setIndicatorUpdateCount(indicatorUpdateCount() + 1)
            setIndicatorSettingModalParams({ visible: false, indicatorName: '', paneId: '', calcParams: [], styles: {} })
          }}
        />
      </Show>
      <Show when={selectedOverlay()}>
        <DrawingToolbar
          locale={props.locale}
          overlay={selectedOverlay()!}
          onColorChange={color => {
            const overlay = selectedOverlay()!
            const styles = lodashClone(overlay.styles || {})
            lodashSet(styles, 'line.color', color)
            lodashSet(styles, 'polygon.borderColor', color)
            lodashSet(styles, 'circle.borderColor', color)
            lodashSet(styles, 'rect.borderColor', color)
            lodashSet(styles, 'text.color', color)
            lodashSet(styles, 'arc.color', color)
            lodashSet(styles, 'rectText.color', color)
            lodashSet(styles, 'rectText.borderColor', color)
            widget()?.overrideOverlay({ id: overlay.id, styles })
            setSelectedOverlay({ ...overlay, styles })
            setOverlayUpdateCount(overlayUpdateCount() + 1)
          }}
          onSizeChange={size => {
            const overlay = selectedOverlay()!
            const styles = lodashClone(overlay.styles || {})
            lodashSet(styles, 'line.size', size)
            lodashSet(styles, 'polygon.borderSize', size)
            lodashSet(styles, 'circle.borderSize', size)
            lodashSet(styles, 'rect.borderSize', size)
            lodashSet(styles, 'arc.size', size)
            widget()?.overrideOverlay({ id: overlay.id, styles })
            setSelectedOverlay({ ...overlay, styles })
            setOverlayUpdateCount(overlayUpdateCount() + 1)
          }}
          onTypeChange={style => {
            const overlay = selectedOverlay()!
            const styles = lodashClone(overlay.styles || {})
            lodashSet(styles, 'line.style', style)
            lodashSet(styles, 'polygon.borderStyle', style)
            lodashSet(styles, 'circle.borderStyle', style)
            lodashSet(styles, 'rect.borderStyle', style)
            lodashSet(styles, 'arc.style', style)
            widget()?.overrideOverlay({ id: overlay.id, styles })
            setSelectedOverlay({ ...overlay, styles })
            setOverlayUpdateCount(overlayUpdateCount() + 1)
          }}
          onLockChange={lock => {
            const overlay = selectedOverlay()!
            widget()?.overrideOverlay({ id: overlay.id, lock })
            setSelectedOverlay({ ...overlay, lock })
            setOverlayUpdateCount(overlayUpdateCount() + 1)
          }}
          onVisibleChange={visible => {
            const overlay = selectedOverlay()!
            widget()?.overrideOverlay({ id: overlay.id, visible })
            setSelectedOverlay({ ...overlay, visible })
            setOverlayUpdateCount(overlayUpdateCount() + 1)
          }}
          onRemoveClick={() => {
            const overlay = selectedOverlay()!
            widget()?.removeOverlay(overlay.id)
            setSelectedOverlay(null)
            setOverlayUpdateCount(overlayUpdateCount() + 1)
          }}
          onClose={() => { setSelectedOverlay(null) }}
        />
      </Show>
      <PeriodBar
        locale={props.locale}
        symbol={symbol()}
        spread={drawingBarVisible()}
        symbolSearchVisible={props.symbolSearchVisible}
        period={period()}
        periods={props.periods}
        onMenuClick={async () => {
          try {
            await startTransition(() => setDrawingBarVisible(!drawingBarVisible()))
          } catch (e) {}    
        }}
        onSymbolClick={() => { setSymbolSearchModalVisible(!symbolSearchModalVisible()) }}
        onPeriodChange={setPeriod}
        onIndicatorClick={() => { setIndicatorModalVisible((visible => !visible)) }}
        onScreenshotClick={() => {
          const w = widget()
          if (w) {
            const url = w.getConvertPictureUrl(true, 'jpeg', props.theme === 'dark' ? '#151517' : '#ffffff')
            setScreenshotUrl(url)
          }
        }}
      />
      <div
        class="klinecharts-pro-content">
        <Show when={loadingVisible()}>
          <Loading/>
        </Show>
        <Show when={drawingBarVisible()}>
          <DrawingBar
            locale={props.locale}
            onDrawingItemClick={overlay => {
              widget()?.createOverlay({
                ...overlay,
                onSelected: (e) => {
                  setSelectedOverlay(e.overlay)
                  return true
                },
                onDeselected: (e) => {
                  setSelectedOverlay(null)
                  return true
                },
                onPressedMoveEnd: (e) => {
                  setOverlayUpdateCount(overlayUpdateCount() + 1)
                  return true
                },
                onDrawEnd: (e) => {
                  setOverlayUpdateCount(overlayUpdateCount() + 1)
                  return true
                },
                onRemoved: (e) => {
                  setOverlayUpdateCount(overlayUpdateCount() + 1)
                  return true
                }
              })
            }}
            onModeChange={mode => { widget()?.overrideOverlay({ mode: mode as OverlayMode }) }}
            onLockChange={lock => { widget()?.overrideOverlay({ lock }) }}
            onVisibleChange={visible => { widget()?.overrideOverlay({ visible }) }}
            onRemoveClick={(groupId, all) => {
              // @ts-expect-error
              const instance = widget()?._chartStore.getOverlayStore().getClickInstanceInfo().instance
              if (all || (all === undefined && !instance)) {
                widget()?.removeOverlay({ groupId })
              } else if (instance) {
                widget()?.removeOverlay(instance.id)
              }
            }}
            onResetClick={resetChart}/>
        </Show>
        <div
          ref={widgetRef}
          class='klinecharts-pro-widget'
          data-drawing-bar-visible={drawingBarVisible()}/>
      </div>
      <div
        class="klinecharts-pro-setting-button"
        onClick={() => { setSettingModalVisible(true) }}>
        <svg viewBox="0 0 24 24">
          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.47,5.34 14.86,5.12L14.47,2.47C14.44,2.23 14.24,2.05 14,2.05H10C9.76,2.05 9.56,2.23 9.53,2.47L9.14,5.12C8.53,5.34 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.95C7.96,18.34 8.53,18.66 9.14,18.88L9.53,21.53C9.56,21.77 9.76,21.95 10,21.95H14C14.24,21.95 14.44,21.77 14.47,21.53L14.86,18.88C15.47,18.66 16.04,18.34 16.56,17.95L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" fill="currentColor"/>
        </svg>
      </div>
    </>
  )
}

export default ChartProComponent