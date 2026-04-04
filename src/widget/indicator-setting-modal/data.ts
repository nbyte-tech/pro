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

export default {
  AO: [
    { paramNameKey: 'fast_length', precision: 0, min: 1, default: 5 },
    { paramNameKey: 'slow_length', precision: 0, min: 1, default: 34 }
  ],
  BIAS: [
    { paramNameKey: 'period_1', precision: 0, min: 1, styleKey: 'lines[0].color' },
    { paramNameKey: 'period_2', precision: 0, min: 1, styleKey: 'lines[1].color' },
    { paramNameKey: 'period_3', precision: 0, min: 1, styleKey: 'lines[2].color' },
    { paramNameKey: 'period_4', precision: 0, min: 1, styleKey: 'lines[3].color' },
    { paramNameKey: 'period_5', precision: 0, min: 1, styleKey: 'lines[4].color' }
  ],
  BOLL: [
    { paramNameKey: 'period', precision: 0, min: 1, default: 20, styleKey: 'lines[0].color' },
    { paramNameKey: 'standard_deviation', precision: 2, min: 1, default: 2, styleKey: 'lines[1].color' }
  ],
  BRAR: [
    { paramNameKey: 'period', precision: 0, min: 1, default: 26 }
  ],
  BBI: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 3 },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 6 },
    { paramNameKey: 'period_3', precision: 0, min: 1, default: 12 },
    { paramNameKey: 'period_4', precision: 0, min: 1, default: 24 }
  ],
  CCI: [
    { paramNameKey: 'period', precision: 0, min: 1, default: 20 }
  ],
  CR: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 26 },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 10 },
    { paramNameKey: 'period_3', precision: 0, min: 1, default: 20 },
    { paramNameKey: 'period_4', precision: 0, min: 1, default: 40 },
    { paramNameKey: 'period_5', precision: 0, min: 1, default: 60 }
  ],
  DMA: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 10 },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 50 },
    { paramNameKey: 'period_3', precision: 0, min: 1, default: 10 }
  ],
  DMI: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 14 },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 6 }
  ],
  EMV: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 14 },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 9 }
  ],
  EMA: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 9, styleKey: 'lines[0].color' },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 20, styleKey: 'lines[1].color' },
    { paramNameKey: 'period_3', precision: 0, min: 1, default: 200, styleKey: 'lines[2].color' },
    { paramNameKey: 'period_4', precision: 0, min: 1, styleKey: 'lines[3].color' },
    { paramNameKey: 'period_5', precision: 0, min: 1, styleKey: 'lines[4].color' }
  ],
  MTM: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 12 },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 6 }
  ],
  MA: [
    { paramNameKey: 'period_1', precision: 0, min: 1, styleKey: 'lines[0].color' },
    { paramNameKey: 'period_2', precision: 0, min: 1, styleKey: 'lines[1].color' },
    { paramNameKey: 'period_3', precision: 0, min: 1, styleKey: 'lines[2].color' },
    { paramNameKey: 'period_4', precision: 0, min: 1, styleKey: 'lines[3].color' },
    { paramNameKey: 'period_5', precision: 0, min: 1, styleKey: 'lines[4].color' },
  ],
  MACD: [
    { paramNameKey: 'fast_length', precision: 0, min: 1, default: 12, styleKey: 'lines[0].color' },
    { paramNameKey: 'slow_length', precision: 0, min: 1, default: 26, styleKey: 'lines[1].color' },
    { paramNameKey: 'signal_length', precision: 0, min: 1, default: 9, styleKey: 'bars[0].noChangeColor' },
    {
      paramNameKey: 'show_histogram',
      type: 'select',
      default: 1,
      dataSource: [
        { key: '0', text: 'hide' },
        { key: '1', text: 'show' }
      ]
    }
  ],
  OBV: [
    { paramNameKey: 'period', precision: 0, min: 1, default: 30 }
  ],
  PVT: [],
  PSY: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 12 },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 6 }
  ],
  ROC: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 12 },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 6 }
  ],
  RSI: [
    { paramNameKey: 'period_1', precision: 0, min: 1, styleKey: 'lines[0].color' },
    { paramNameKey: 'period_2', precision: 0, min: 1, styleKey: 'lines[1].color' },
    { paramNameKey: 'period_3', precision: 0, min: 1, styleKey: 'lines[2].color' },
    { paramNameKey: 'period_4', precision: 0, min: 1, styleKey: 'lines[3].color' },
    { paramNameKey: 'period_5', precision: 0, min: 1, styleKey: 'lines[4].color' }
  ],
  SMA: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 12 },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 2 }
  ],
  KDJ: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 9, styleKey: 'lines[0].color' },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 3, styleKey: 'lines[1].color' },
    { paramNameKey: 'period_3', precision: 0, min: 1, default: 3, styleKey: 'lines[2].color' }
  ],
  SAR: [
    { paramNameKey: 'sar_start', precision: 0, min: 1, default: 2 },
    { paramNameKey: 'sar_incremental', precision: 0, min: 1, default: 2 },
    { paramNameKey: 'sar_max', precision: 0, min: 1, default: 20 }
  ],
  TRIX: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 12 },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 9 }
  ],
  VOL: [],
  VR: [
    { paramNameKey: 'period_1', precision: 0, min: 1, default: 26 },
    { paramNameKey: 'period_2', precision: 0, min: 1, default: 6 }
  ],
  VWAP: [
    {
      paramNameKey: 'reset_period',
      type: 'select',
      default: 0,
      styleKey: 'lines[0].color',
      dataSource: [
        { key: '0', text: 'session' },
        { key: '1', text: 'weekly' },
        { key: '2', text: 'monthly' }
      ]
    }
  ],
  WR: [
    { paramNameKey: 'period_1', precision: 0, min: 1, styleKey: 'lines[0].color' },
    { paramNameKey: 'period_2', precision: 0, min: 1, styleKey: 'lines[1].color' },
    { paramNameKey: 'period_3', precision: 0, min: 1, styleKey: 'lines[2].color' },
    { paramNameKey: 'period_4', precision: 0, min: 1, styleKey: 'lines[3].color' },
    { paramNameKey: 'period_5', precision: 0, min: 1, styleKey: 'lines[4].color' },
  ]
}
