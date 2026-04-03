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

import { createSignal, createEffect, onMount, Show, onCleanup, startTransition, Component, untrack } from 'solid-js'
import { render } from 'solid-js/web'

import {
  init, dispose, utils, Nullable, Chart, OverlayMode, Styles, DeepPartial,
  TooltipIconPosition, ActionType, PaneOptions, Indicator, DomPosition, FormatDateType
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
  ScreenshotModal, IndicatorSettingModal, SymbolSearchModal
} from './widget'

import { translateTimezone } from './widget/setting-modal/data'
import indicatorConfigs from './widget/indicator-setting-modal/data'

import { SymbolInfo, Period, ChartProOptions, ChartPro } from './types'

export interface ChartProComponentProps extends Required<Omit<ChartProOptions, 'container'>> {
  ref: (chart: ChartPro) => void
}

interface PrevSymbolPeriod {
  symbol: SymbolInfo
  period: Period
}

function createIndicator (widget: Nullable<Chart>, indicatorName: string, isStack?: boolean, paneOptions?: PaneOptions): Nullable<string> {
  if (indicatorName === 'VOL') {
    paneOptions = { gap: { bottom: 2 }, ...paneOptions }
  }
  // @ts-expect-error
  const config = indicatorConfigs[indicatorName]
  const calcParams = config?.map((c: any) => c.default).filter((d: any) => d !== undefined)
  return widget?.createIndicator({
    name: indicatorName,
    calcParams: (calcParams && (calcParams.length > 0 || indicatorName === 'VOL')) ? calcParams : undefined,
    regenerateFigures: indicatorName === 'VOL' ? () => {
      return [
        {
          key: 'volume',
          title: 'VOLUME: ',
          type: 'bar',
          baseValue: 0,
          styles: (data, indicator, defaultStyles) => {
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
      const icons = []
      const showSetting = !!config && config.length > 0
      if (indicator.visible) {
        icons.push(defaultStyles.tooltip.icons[1])
        if (showSetting) {
          icons.push(defaultStyles.tooltip.icons[2])
        }
        icons.push(defaultStyles.tooltip.icons[3])
      } else {
        icons.push(defaultStyles.tooltip.icons[0])
        if (showSetting) {
          icons.push(defaultStyles.tooltip.icons[2])
        }
        icons.push(defaultStyles.tooltip.icons[3])
      }
      return { icons }
    }
  }, isStack, paneOptions) ?? null
}

const ChartProComponent: Component<ChartProComponentProps> = props => {
  let widgetRef: HTMLDivElement | undefined = undefined
  let widget: Nullable<Chart> = null

  let priceUnitDom: HTMLElement

  const [loading, setLoading] = createSignal(false)
  const [theme, setTheme] = createSignal(props.theme)
  const [styles, setStyles] = createSignal<any>(props.styles)
  const [locale, setLocale] = createSignal(props.locale)

  const [symbol, setSymbol] = createSignal(props.symbol)
  const [period, setPeriod] = createSignal(props.period)
  const [indicatorModalVisible, setIndicatorModalVisible] = createSignal(false)
  const [mainIndicators, setMainIndicators] = createSignal([...(props.mainIndicators!)])
  const [subIndicators, setSubIndicators] = createSignal({})

  const defaultTz = props.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const [timezone, setTimezone] = createSignal<SelectDataSourceItem>({ key: defaultTz, text: translateTimezone(defaultTz, props.locale) })

  const [settingModalVisible, setSettingModalVisible] = createSignal(false)
  const [widgetDefaultStyles, setWidgetDefaultStyles] = createSignal<any>()

  const [screenshotUrl, setScreenshotUrl] = createSignal('')

  const [drawingBarVisible, setDrawingBarVisible] = createSignal(props.drawingBarVisible)

  const [symbolSearchModalVisible, setSymbolSearchModalVisible] = createSignal(false)

  const [loadingVisible, setLoadingVisible] = createSignal(false)

  const [indicatorSettingModalParams, setIndicatorSettingModalParams] = createSignal({
    visible: false, indicatorName: '', paneId: '', calcParams: [] as Array<any>
  })

  props.ref({
    setTheme,
    getTheme: () => theme(),
    setStyles: (s: DeepPartial<Styles>) => {
      widget?.setStyles(s)
      if (widget) {
        const newStyles = lodashClone(styles())
        lodashMerge(newStyles, s)
        setStyles(newStyles)
      }
    },
    getStyles: () => widget!.getStyles(),
    setLocale,
    getLocale: () => locale(),
    setTimezone: (timezone: string) => { setTimezone({ key: timezone, text: translateTimezone(timezone, locale()) }) },
    getTimezone: () => timezone().key,
    setSymbol,
    getSymbol: () => symbol(),
    setPeriod,
    getPeriod: () => period(),
    resize: () => {
      widget?.resize()
    },
    dispose: () => {
      if (widget) {
        dispose(widget)
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
    if (widget) {
      widget.scrollToRealTime()
      // @ts-expect-error
      const pane = widget._panes.get('candle_pane')
      if (pane) {
        const yAxis = pane.getAxisComponent()
        yAxis.setAutoCalcTickFlag(true)
        // @ts-expect-error
        widget.adjustPaneViewport(false, true, true, true, true)
      }
    }
  }

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (widget) {
          // @ts-expect-error
          const instance = widget._chartStore.getOverlayStore().getClickInstanceInfo().instance
          if (instance) {
            widget.removeOverlay(instance.id)
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
            const instance = widget?._chartStore.getOverlayStore().getClickInstanceInfo().instance
            if (instance) {
              widget?.removeOverlay(instance.id)
            }
          }

          if (overlayName) {
            widget?.createOverlay({ name: overlayName, groupId: 'drawing_tools' })
          }
        }
      }
    }
    window.addEventListener('keydown', handler)
    onCleanup(() => {
      window.removeEventListener('keydown', handler)
    })
    widget = init(widgetRef!, {
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

    if (widget) {
      const watermarkContainer = widget.getDom('candle_pane', DomPosition.Main)
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

      const priceUnitContainer = widget.getDom('candle_pane', DomPosition.YAxis)
      priceUnitDom = document.createElement('span')
      priceUnitDom.className = 'klinecharts-pro-price-unit'
      priceUnitContainer?.appendChild(priceUnitDom)
      if (priceUnitContainer) {
        priceUnitContainer.addEventListener('wheel', (e) => {
          e.preventDefault()
          e.stopPropagation()
          const rect = priceUnitContainer.getBoundingClientRect()
          const delta = e.deltaY
          if (delta === 0) {
            return
          }
          const zoomFactor = Math.pow(0.95, -delta / 100)
          const mouseY = e.clientY - rect.top

          // @ts-expect-error
          const pane = widget!._panes.get('candle_pane')
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
            widget!.adjustPaneViewport(false, true, true, true, true)
          }
        }, { passive: false })

        priceUnitContainer.addEventListener('dblclick', () => {
          // @ts-expect-error
          const pane = widget!._panes.get('candle_pane')
          if (pane) {
            const yAxis = pane.getAxisComponent()
            yAxis.setAutoCalcTickFlag(true)
            // @ts-expect-error
            widget!.adjustPaneViewport(false, true, true, true, true)
          }
        })
      }
    }

    mainIndicators().forEach(indicator => {
      createIndicator(widget, indicator, true, { id: 'candle_pane' })
    })
    const subIndicatorMap = {}
    props.subIndicators!.forEach(indicator => {
      const paneId = createIndicator(widget, indicator, true)
      if (paneId) {
        // @ts-expect-error
        subIndicatorMap[indicator] = paneId
      }
    })
    setSubIndicators(subIndicatorMap)
    widget?.loadMore(timestamp => {
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
        widget?.applyMoreData(filteredData, kLineDataList.length > 0)
        setLoading(false)
      }
      get()
    })
    widget?.subscribeAction(ActionType.OnTooltipIconClick, (data) => {
      if (data.indicatorName) {
        switch (data.iconId) {
          case 'visible': {
            widget?.overrideIndicator({ name: data.indicatorName, visible: true }, data.paneId)
            break
          }
          case 'invisible': {
            widget?.overrideIndicator({ name: data.indicatorName, visible: false }, data.paneId)
            break
          }
          case 'setting': {
            const indicator = widget?.getIndicatorByPaneId(data.paneId, data.indicatorName) as Indicator
            setIndicatorSettingModalParams({
              visible: true, indicatorName: data.indicatorName, paneId: data.paneId, calcParams: indicator.calcParams
            })
            break
          }
          case 'close': {
            if (data.paneId === 'candle_pane') {
              const newMainIndicators = [...mainIndicators()]
              widget?.removeIndicator('candle_pane', data.indicatorName)
              newMainIndicators.splice(newMainIndicators.indexOf(data.indicatorName), 1)
              setMainIndicators(newMainIndicators)
            } else {
              const newIndicators = { ...subIndicators() }
              widget?.removeIndicator(data.paneId, data.indicatorName)
              // @ts-expect-error
              delete newIndicators[data.indicatorName]
              setSubIndicators(newIndicators)
            }
          }
        }
      }
    })

    const resizeObserver = new ResizeObserver(() => {
      widget?.resize()
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
    widget?.setPriceVolumePrecision(s?.pricePrecision ?? 2, s?.volumePrecision ?? 0)
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
      widget?.applyNewData(filteredData, kLineDataList.length > 0)
      props.datafeed.subscribe(s, p, data => {
        const showExtended = !!utils.formatValue(styles(), 'candle.extendedHours.show')
        if (showExtended || (p.timespan !== 'minute' && p.timespan !== 'hour') || isRegularSession(data.timestamp)) {
          widget?.updateData(data)
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
    widget?.setStyles(t)
    const color = t === 'dark' ? '#929AA5' : '#76808F'
    widget?.setStyles({
      indicator: {
        tooltip: {
          icons: [
            {
              id: 'visible',
              position: TooltipIconPosition.Middle,
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
              position: TooltipIconPosition.Middle,
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
              position: TooltipIconPosition.Middle,
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
              position: TooltipIconPosition.Middle,
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
        }
      }
    })
    if (widget) {
      const themeStyles = widget.getStyles()
      setWidgetDefaultStyles(lodashClone(themeStyles))
      const newStyles = lodashClone(untrack(() => styles()))
      lodashMerge(newStyles, themeStyles)
      setStyles(newStyles)
    }
  })

  createEffect(() => {
    widget?.setLocale(locale())
  })

  createEffect(() => {
    widget?.setTimezone(timezone().key)
  })

  createEffect(() => {
    const s = styles()
    const p = period()
    if (s && widget) {
      const showHighlight = !!utils.formatValue(s, 'candle.extendedHours.show') && (p.timespan === 'minute' || p.timespan === 'hour')

      if (showHighlight) {
        const extendData = {
          // @ts-ignore
          getDataList: () => widget!.getDataList()
        }
        if (widget.getOverlayById('extendedHoursHighlight')) {
          widget.overrideOverlay({
            id: 'extendedHoursHighlight',
            // @ts-ignore
            zLevel: -1,
            extendData
          })
        } else {
          widget.createOverlay({
            name: 'extendedHoursHighlight',
            id: 'extendedHoursHighlight',
            groupId: 'extendedHoursHighlight',
            lock: true,
            // @ts-ignore
            zLevel: -1,
            extendData
          })
        }
      } else {
        widget.removeOverlay({ id: 'extendedHoursHighlight' })
      }
    }
  })

  createEffect(() => {
    if (styles()) {
      widget?.setStyles(styles())
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
          mainIndicators={mainIndicators()}
          subIndicators={subIndicators()}
          onClose={() => { setIndicatorModalVisible(false) }}
          onMainIndicatorChange={data => {
            const newMainIndicators = [...mainIndicators()]
            if (data.added) {
              createIndicator(widget, data.name, true, { id: 'candle_pane' })
              newMainIndicators.push(data.name)
            } else {
              widget?.removeIndicator('candle_pane', data.name)
              newMainIndicators.splice(newMainIndicators.indexOf(data.name), 1)
            }
            setMainIndicators(newMainIndicators)
          }}
          onSubIndicatorChange={data => {
            const newSubIndicators = { ...subIndicators() }
            if (data.added) {
              const paneId = createIndicator(widget, data.name)
              if (paneId) {
                // @ts-expect-error
                newSubIndicators[data.name] = paneId
              }
            } else {
              if (data.paneId) {
                widget?.removeIndicator(data.paneId, data.name)
                // @ts-expect-error
                delete newSubIndicators[data.name]
              }
            }
            setSubIndicators(newSubIndicators)
          }}/>
      </Show>
      <Show when={settingModalVisible()}>
        <SettingModal
          locale={props.locale}
          currentStyles={styles() as any}
          timezone={timezone()}
          onClose={() => { setSettingModalVisible(false) }}
          onTimezoneChange={setTimezone}
          onChange={style => {
            widget?.setStyles(style)
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
            widget?.setStyles(style)
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
          onClose={() => { setIndicatorSettingModalParams({ visible: false, indicatorName: '', paneId: '', calcParams: [] }) }}
          onConfirm={(params)=> {
            const modalParams = indicatorSettingModalParams()
            widget?.overrideIndicator({ name: modalParams.indicatorName, calcParams: params }, modalParams.paneId)
          }}
        />
      </Show>
      <PeriodBar
        locale={props.locale}
        symbol={symbol()}
        spread={drawingBarVisible()}
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
        onTimezoneClick={() => { setSettingModalVisible((visible => !visible)) }}
        onSettingClick={() => { setSettingModalVisible((visible => !visible)) }}
        onScreenshotClick={() => {
          if (widget) {
            const url = widget.getConvertPictureUrl(true, 'jpeg', props.theme === 'dark' ? '#151517' : '#ffffff')
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
            onDrawingItemClick={overlay => { widget?.createOverlay(overlay) }}
            onModeChange={mode => { widget?.overrideOverlay({ mode: mode as OverlayMode }) }}
            onLockChange={lock => { widget?.overrideOverlay({ lock }) }}
            onVisibleChange={visible => { widget?.overrideOverlay({ visible }) }}
            onRemoveClick={(groupId, all) => {
              // @ts-expect-error
              const instance = widget?._chartStore.getOverlayStore().getClickInstanceInfo().instance
              if (all || (all === undefined && !instance)) {
                widget?.removeOverlay({ groupId })
              } else if (instance) {
                widget?.removeOverlay(instance.id)
              }
            }}
            onResetClick={resetChart}/>
        </Show>
        <div
          ref={widgetRef}
          class='klinecharts-pro-widget'
          data-drawing-bar-visible={drawingBarVisible()}/>
      </div>
    </>
  )
}

export default ChartProComponent