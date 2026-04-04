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

import { KLineData, Styles, DeepPartial, OverlayMode } from 'klinecharts'

export interface SymbolInfo {
  ticker: string
  name?: string
  shortName?: string
  exchange?: string
  market?: string
  pricePrecision?: number
  volumePrecision?: number
  priceCurrency?: string
  type?: string
  logo?: string
}

export interface Period {
  multiplier: number
  timespan: string
  text: string
}

export type DatafeedSubscribeCallback = (data: KLineData) => void

export interface Datafeed {
  searchSymbols (search?: string): Promise<SymbolInfo[]>
  getHistoryKLineData (symbol: SymbolInfo, period: Period, from: number, to: number): Promise<KLineData[]>
  subscribe (symbol: SymbolInfo, period: Period, callback: DatafeedSubscribeCallback): void
  unsubscribe (symbol: SymbolInfo, period: Period): void
}

export interface ChartProOptions {
  container: string | HTMLElement
  styles?: DeepPartial<Styles>
  watermark?: any
  theme?: string
  locale?: string
  drawingBarVisible?: boolean
  symbolSearchVisible?: boolean
  symbol: SymbolInfo
  period: Period
  periods?: Period[]
  timezone?: string
  mainIndicators?: (string | IndicatorConfig)[]
  subIndicators?: (string | IndicatorConfig)[]
  overlays?: OverlayConfig[]
  lastOverlayStyles?: Record<string, any>
  datafeed: Datafeed
  onConfigChange?: (config: ChartConfig) => void
}

export interface IndicatorConfig {
  name: string
  calcParams?: any[]
  styles?: any
}

export interface OverlayConfig {
  name: string
  id?: string
  points?: any[]
  styles?: any
  lock?: boolean
  visible?: boolean
  mode?: OverlayMode
  extendData?: any
}

export interface ChartConfig {
  symbol: SymbolInfo
  period: Period
  timezone: string
  mainIndicators: (string | IndicatorConfig)[]
  subIndicators: (string | IndicatorConfig)[]
  overlays?: OverlayConfig[]
  lastOverlayStyles?: Record<string, any>
  styles: DeepPartial<Styles>
  theme: string
  locale: string
}

export interface ChartPro {
  setTheme(theme: string): void
  getTheme(): string
  setStyles(styles: DeepPartial<Styles>): void
  getStyles(): Styles
  setLocale(locale: string): void
  getLocale(): string
  setTimezone(timezone: string): void
  getTimezone(): string
  setSymbol(symbol: SymbolInfo): void
  getSymbol(): SymbolInfo
  setPeriod(period: Period): void
  getPeriod(): Period
  resize(): void
  dispose(): void
  extractChartConfigs(): ChartConfig
}
