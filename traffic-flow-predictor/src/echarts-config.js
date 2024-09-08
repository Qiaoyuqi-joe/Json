// src/echarts-config.js

import * as echarts from "echarts/core";
import { BarChart, ScatterChart } from "echarts/charts";
import {
  TooltipComponent,
  GridComponent,
  GeoComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  ScatterChart,
  TooltipComponent,
  GridComponent,
  GeoComponent,
  LegendComponent,
  CanvasRenderer,
]);

export default echarts;
