# EpochDashboard C++ Builder Library

A comprehensive C++ library for building interactive dashboards, charts, tables, and cards using the fluent builder pattern. This library provides type-safe builders that integrate seamlessly with Apache Arrow-based DataFrames and Series.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Builders Overview](#builders-overview)
  - [ScalarFactory](#scalarfactory)
  - [TableBuilder](#tablebuilder)
  - [CardBuilder](#cardbuilder)
  - [Chart Builders](#chart-builders)
    - [LinesChartBuilder](#lineschartbuilder)
    - [BarChartBuilder](#barchartbuilder)
    - [PieChartBuilder](#piechartbuilder)
    - [HistogramChartBuilder](#histogramchartbuilder)
    - [BoxPlotChartBuilder](#boxplotchartbuilder)
    - [HeatMapChartBuilder](#heatmapchartbuilder)
    - [XRangeChartBuilder](#xrangechartbuilder)
  - [Dashboard Builders](#dashboard-builders)
    - [DashboardBuilder](#dashboardbuilder)
    - [FullDashboardBuilder](#fulldashboardbuilder)
- [Complete Examples](#complete-examples)

## Installation

Include the necessary headers in your project:

```cpp
#include <epoch_dashboard/tearsheet/table_builder.h>
#include <epoch_dashboard/tearsheet/card_builder.h>
#include <epoch_dashboard/tearsheet/lines_chart_builder.h>
#include <epoch_dashboard/tearsheet/bar_chart_builder.h>
#include <epoch_dashboard/tearsheet/pie_chart_builder.h>
#include <epoch_dashboard/tearsheet/histogram_chart_builder.h>
#include <epoch_dashboard/tearsheet/boxplot_chart_builder.h>
#include <epoch_dashboard/tearsheet/heatmap_chart_builder.h>
#include <epoch_dashboard/tearsheet/xrange_chart_builder.h>
#include <epoch_dashboard/tearsheet/tearsheet_builder.h>
#include <epoch_dashboard/tearsheet/scalar_converter.h>
```

## Quick Start

```cpp
using namespace epoch_tearsheet;
using namespace epoch_frame;

// Create a simple card
auto card = CardBuilder()
    .setType(epoch_proto::WidgetCard)
    .setCategory("Performance")
    .addCardData(
        CardDataBuilder()
            .setTitle("Total Return")
            .setValue(ScalarFactory::fromDecimal(15.7))
            .setType(epoch_proto::TypeDecimal)
            .build()
    )
    .build();

// Create a simple table from DataFrame
DataFrame df = loadData();
auto table = TableBuilder()
    .setTitle("Holdings")
    .fromDataFrame(df)
    .build();
```

## Builders Overview

### ScalarFactory

Creates scalar values for use in cards and charts. **Important:** Always use the safe casting pattern `scalar.cast(type).as_*()` when converting scalar values.

#### Methods

```cpp
// Create from epoch_frame::Scalar (safe casting required)
static epoch_proto::Scalar create(const epoch_frame::Scalar& scalar);

// Create from primitive types
static epoch_proto::Scalar fromBool(bool value);
static epoch_proto::Scalar fromInteger(int64_t value);
static epoch_proto::Scalar fromDecimal(double value);
static epoch_proto::Scalar fromString(const std::string& value);
static epoch_proto::Scalar fromTimestamp(std::chrono::milliseconds ms);
static epoch_proto::Scalar fromTimestamp(std::chrono::seconds s);
static epoch_proto::Scalar null();
```

#### Example

```cpp
// Create scalar values
auto percent = ScalarFactory::fromDecimal(15.7);
auto count = ScalarFactory::fromInteger(1250);
auto label = ScalarFactory::fromString("Active");
auto timestamp = ScalarFactory::fromTimestamp(std::chrono::milliseconds(1234567890));
auto null_val = ScalarFactory::null();

// Safe conversion from epoch_frame::Scalar
epoch_frame::Scalar scalar(42.5);
auto proto_scalar = ScalarFactory::create(scalar);
```

### TableBuilder

Creates tables from DataFrames or manually added columns and rows.

#### Methods

```cpp
TableBuilder& setType(epoch_proto::EpochFolioDashboardWidget type);
TableBuilder& setCategory(const std::string& category);
TableBuilder& setTitle(const std::string& title);
TableBuilder& addColumn(const epoch_proto::ColumnDef& col);
TableBuilder& addColumn(const std::string& id, const std::string& name,
                       epoch_proto::EpochFolioType type);
TableBuilder& addColumns(const std::vector<epoch_proto::ColumnDef>& cols);
TableBuilder& addRow(const epoch_proto::TableRow& row);
TableBuilder& addRows(const std::vector<epoch_proto::TableRow>& rows);
TableBuilder& fromDataFrame(const epoch_frame::DataFrame& df,
                            const std::vector<std::string>& columns = {});
epoch_proto::Table build() const;
```

#### Example

```cpp
// From DataFrame (all columns)
auto table1 = TableBuilder()
    .setTitle("Portfolio Holdings")
    .setCategory("Holdings")
    .fromDataFrame(df)
    .build();

// From DataFrame (selected columns only)
auto table2 = TableBuilder()
    .setTitle("Key Metrics")
    .fromDataFrame(df, {"Symbol", "Price", "Change"})
    .build();

// Manual construction
auto table3 = TableBuilder()
    .setTitle("Custom Table")
    .addColumn("id", "ID", epoch_proto::TypeInteger)
    .addColumn("name", "Name", epoch_proto::TypeString)
    .addColumn("value", "Value", epoch_proto::TypeDecimal)
    .build();
```

### CardBuilder

Creates card widgets for displaying key metrics.

#### Classes

- **CardDataBuilder**: Builds individual card data items
- **CardBuilder**: Builds card widgets containing multiple card data items

#### Methods

##### CardDataBuilder

```cpp
CardDataBuilder& setTitle(const std::string& title);
CardDataBuilder& setValue(const epoch_proto::Scalar& value);
CardDataBuilder& setType(epoch_proto::EpochFolioType type);
CardDataBuilder& setGroup(uint64_t group);
epoch_proto::CardData build() const;
```

##### CardBuilder

```cpp
CardBuilder& setType(epoch_proto::EpochFolioDashboardWidget type);
CardBuilder& setCategory(const std::string& category);
CardBuilder& addCardData(const epoch_proto::CardData& card_data);
CardBuilder& setGroupSize(uint64_t group_size);
epoch_proto::CardDef build() const;
```

#### Example

```cpp
// Single metric card
auto card1 = CardBuilder()
    .setType(epoch_proto::WidgetCard)
    .setCategory("Performance")
    .addCardData(
        CardDataBuilder()
            .setTitle("Sharpe Ratio")
            .setValue(ScalarFactory::fromDecimal(1.85))
            .setType(epoch_proto::TypeDecimal)
            .build()
    )
    .build();

// Multi-metric card with groups
auto card2 = CardBuilder()
    .setType(epoch_proto::WidgetCard)
    .setCategory("Returns")
    .setGroupSize(2)
    .addCardData(
        CardDataBuilder()
            .setTitle("1 Year")
            .setValue(ScalarFactory::fromDecimal(15.7))
            .setGroup(0)
            .build()
    )
    .addCardData(
        CardDataBuilder()
            .setTitle("3 Year")
            .setValue(ScalarFactory::fromDecimal(42.3))
            .setGroup(0)
            .build()
    )
    .addCardData(
        CardDataBuilder()
            .setTitle("Total Trades")
            .setValue(ScalarFactory::fromInteger(1543))
            .setGroup(1)
            .build()
    )
    .build();
```

## Chart Builders

### LinesChartBuilder

Creates line charts with multiple series, overlays, and plot bands.

#### Methods

```cpp
LinesChartBuilder& setTitle(const std::string& title);
LinesChartBuilder& setCategory(const std::string& category);
LinesChartBuilder& setXAxisLabel(const std::string& label);
LinesChartBuilder& setYAxisLabel(const std::string& label);
LinesChartBuilder& addLine(const epoch_proto::Line& line);
LinesChartBuilder& addLines(const std::vector<epoch_proto::Line>& lines);
LinesChartBuilder& addStraightLine(const epoch_proto::StraightLineDef& line);
LinesChartBuilder& addYPlotBand(const epoch_proto::Band& band);
LinesChartBuilder& addXPlotBand(const epoch_proto::Band& band);
LinesChartBuilder& setOverlay(const epoch_proto::Line& overlay);
LinesChartBuilder& setStacked(bool stacked);
LinesChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df,
                                 const std::string& x_col,
                                 const std::vector<std::string>& y_cols);
epoch_proto::Chart build() const;
```

#### Example

```cpp
// From DataFrame
auto lines_chart = LinesChartBuilder()
    .setTitle("Portfolio Performance")
    .setCategory("Performance")
    .setXAxisLabel("Date")
    .setYAxisLabel("Return (%)")
    .fromDataFrame(df, "date", {"portfolio", "benchmark"})
    .setStacked(false)
    .build();

// With plot bands and straight lines
epoch_proto::Band recession_band;
recession_band.set_from(20200301);
recession_band.set_to(20200601);
recession_band.set_color("#FFE5E5");

epoch_proto::StraightLineDef target_line;
target_line.set_title("Target");
target_line.set_value(10.0);
target_line.set_vertical(false);

auto chart = LinesChartBuilder()
    .setTitle("Returns with Targets")
    .addYPlotBand(recession_band)
    .addStraightLine(target_line)
    .fromDataFrame(df, "date", {"returns"})
    .build();
```

### BarChartBuilder

Creates bar charts (vertical or horizontal).

#### Methods

```cpp
BarChartBuilder& setTitle(const std::string& title);
BarChartBuilder& setCategory(const std::string& category);
BarChartBuilder& setXAxisLabel(const std::string& label);
BarChartBuilder& setYAxisLabel(const std::string& label);
BarChartBuilder& setData(const epoch_proto::Array& data);
BarChartBuilder& addStraightLine(const epoch_proto::StraightLineDef& line);
BarChartBuilder& setBarWidth(uint32_t width);
BarChartBuilder& setVertical(bool vertical);
BarChartBuilder& fromSeries(const epoch_frame::Series& series);
BarChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df,
                               const std::string& column);
epoch_proto::Chart build() const;
```

#### Example

```cpp
// From DataFrame column
auto bar_chart = BarChartBuilder()
    .setTitle("Quarterly Sales")
    .setCategory("Revenue")
    .setXAxisLabel("Quarter")
    .setYAxisLabel("Sales ($)")
    .fromDataFrame(df, "sales")
    .setVertical(true)
    .build();

// With target line
epoch_proto::StraightLineDef average;
average.set_title("Average");
average.set_value(175.0);
average.set_vertical(false);

auto chart = BarChartBuilder()
    .setTitle("Sales vs Target")
    .fromDataFrame(df, "sales")
    .addStraightLine(average)
    .setBarWidth(50)
    .build();
```

### PieChartBuilder

Creates pie and donut charts.

#### Methods

```cpp
PieChartBuilder& setTitle(const std::string& title);
PieChartBuilder& setCategory(const std::string& category);
PieChartBuilder& addSeries(const std::string& name,
                           const std::vector<epoch_proto::PieData>& points,
                           const PieSize& size,
                           const std::optional<PieInnerSize>& inner_size = std::nullopt);
PieChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df,
                               const std::string& name_col,
                               const std::string& value_col,
                               const std::string& series_name,
                               const PieSize& size,
                               const std::optional<PieInnerSize>& inner_size = std::nullopt);
epoch_proto::Chart build() const;
```

#### Example

```cpp
// Pie chart from DataFrame
auto pie_chart = PieChartBuilder()
    .setTitle("Asset Allocation")
    .setCategory("Portfolio")
    .fromDataFrame(df, "asset_class", "weight", "Allocation",
                   PieSize::percentage(80),
                   std::nullopt)
    .build();

// Donut chart (with inner size)
auto donut_chart = PieChartBuilder()
    .setTitle("Sector Distribution")
    .fromDataFrame(df, "sector", "value", "Sectors",
                   PieSize::percentage(80),
                   PieInnerSize::percentage(50))
    .build();
```

### HistogramChartBuilder

Creates histogram charts from data distributions.

#### Methods

```cpp
HistogramChartBuilder& setTitle(const std::string& title);
HistogramChartBuilder& setCategory(const std::string& category);
HistogramChartBuilder& setXAxisLabel(const std::string& label);
HistogramChartBuilder& setYAxisLabel(const std::string& label);
HistogramChartBuilder& setData(const epoch_proto::Array& data);
HistogramChartBuilder& addStraightLine(const epoch_proto::StraightLineDef& line);
HistogramChartBuilder& setBinsCount(uint32_t bins);
HistogramChartBuilder& fromSeries(const epoch_frame::Series& series,
                                  uint32_t bins = 30);
HistogramChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df,
                                     const std::string& column,
                                     uint32_t bins = 30);
epoch_proto::Chart build() const;
```

#### Example

```cpp
// From DataFrame column with 50 bins
auto histogram = HistogramChartBuilder()
    .setTitle("Return Distribution")
    .setCategory("Risk Analysis")
    .setXAxisLabel("Return (%)")
    .setYAxisLabel("Frequency")
    .fromDataFrame(df, "daily_returns", 50)
    .build();

// With mean line
epoch_proto::StraightLineDef mean_line;
mean_line.set_title("Mean");
mean_line.set_value(0.05);
mean_line.set_vertical(true);

auto chart = HistogramChartBuilder()
    .setTitle("Distribution with Mean")
    .fromDataFrame(df, "returns", 30)
    .addStraightLine(mean_line)
    .build();
```

### BoxPlotChartBuilder

Creates box plot charts for statistical distribution visualization.

#### Methods

```cpp
BoxPlotChartBuilder& setTitle(const std::string& title);
BoxPlotChartBuilder& setCategory(const std::string& category);
BoxPlotChartBuilder& setXAxisLabel(const std::string& label);
BoxPlotChartBuilder& setYAxisLabel(const std::string& label);
BoxPlotChartBuilder& addOutlier(const epoch_proto::BoxPlotOutlier& outlier);
BoxPlotChartBuilder& addDataPoint(const epoch_proto::BoxPlotDataPoint& point);
epoch_proto::Chart build() const;
```

#### Example

```cpp
// Create box plot data point
epoch_proto::BoxPlotDataPoint point;
point.set_x(0);
point.set_low(45.0);
point.set_q1(52.0);
point.set_median(58.0);
point.set_q3(65.0);
point.set_high(72.0);

epoch_proto::BoxPlotOutlier outlier;
outlier.set_x(0);
outlier.set_y(90.0);

auto boxplot = BoxPlotChartBuilder()
    .setTitle("Performance Distribution")
    .setCategory("Statistics")
    .setXAxisLabel("Strategy")
    .setYAxisLabel("Return (%)")
    .addDataPoint(point)
    .addOutlier(outlier)
    .build();
```

### HeatMapChartBuilder

Creates heat map visualizations for matrix data.

#### Methods

```cpp
HeatMapChartBuilder& setTitle(const std::string& title);
HeatMapChartBuilder& setCategory(const std::string& category);
HeatMapChartBuilder& setXAxisLabel(const std::string& label);
HeatMapChartBuilder& setYAxisLabel(const std::string& label);
HeatMapChartBuilder& addPoint(uint64_t x, uint64_t y, double value);
HeatMapChartBuilder& addPoints(const std::vector<epoch_proto::HeatMapPoint>& points);
epoch_proto::Chart build() const;
```

#### Example

```cpp
// Create correlation matrix
auto heatmap = HeatMapChartBuilder()
    .setTitle("Asset Correlation Matrix")
    .setCategory("Risk")
    .setXAxisLabel("Asset 1")
    .setYAxisLabel("Asset 2")
    .addPoint(0, 0, 1.0)
    .addPoint(0, 1, 0.75)
    .addPoint(1, 0, 0.75)
    .addPoint(1, 1, 1.0)
    .build();

// Bulk add points
std::vector<epoch_proto::HeatMapPoint> points;
for (int i = 0; i < 5; ++i) {
    for (int j = 0; j < 5; ++j) {
        epoch_proto::HeatMapPoint pt;
        pt.set_x(i);
        pt.set_y(j);
        pt.set_value(i * j * 0.1);
        points.push_back(pt);
    }
}

auto heatmap2 = HeatMapChartBuilder()
    .setTitle("Value Grid")
    .addPoints(points)
    .build();
```

### XRangeChartBuilder

Creates x-range (Gantt-style) charts for time ranges.

#### Methods

```cpp
XRangeChartBuilder& setTitle(const std::string& title);
XRangeChartBuilder& setCategory(const std::string& category);
XRangeChartBuilder& setXAxisLabel(const std::string& label);
XRangeChartBuilder& setYAxisLabel(const std::string& label);
XRangeChartBuilder& addCategory(const std::string& category);
XRangeChartBuilder& addPoint(int64_t x, int64_t x2, uint64_t y,
                             bool is_long = false);
XRangeChartBuilder& addPoint(const epoch_proto::XRangePoint& point);
epoch_proto::Chart build() const;
```

#### Example

```cpp
// Trade duration visualization
auto xrange = XRangeChartBuilder()
    .setTitle("Trade Positions")
    .setCategory("Trading")
    .setXAxisLabel("Time")
    .setYAxisLabel("Position")
    .addCategory("AAPL")
    .addCategory("GOOGL")
    .addPoint(20200101, 20200601, 0, true)   // Long position
    .addPoint(20200301, 20200501, 1, false)  // Short position
    .build();

// Using XRangePoint
epoch_proto::XRangePoint point;
point.set_x(20230101);
point.set_x2(20230630);
point.set_y(0);
point.set_is_long(true);

auto chart = XRangeChartBuilder()
    .setTitle("Position Timeline")
    .addCategory("Strategy A")
    .addPoint(point)
    .build();
```

## Dashboard Builders

### DashboardBuilder

Builds a single dashboard category containing cards, charts, and tables.

#### Methods

```cpp
DashboardBuilder& setCategory(const std::string& category);
DashboardBuilder& addCard(const epoch_proto::CardDef& card);
DashboardBuilder& addChart(const epoch_proto::Chart& chart);
DashboardBuilder& addTable(const epoch_proto::Table& table);
epoch_proto::TearSheet build() const;
```

#### Example

```cpp
// Build a complete dashboard
auto dashboard = DashboardBuilder()
    .setCategory("Performance Overview")
    .addCard(performance_card)
    .addChart(returns_chart)
    .addChart(drawdown_chart)
    .addTable(holdings_table)
    .build();
```

### FullDashboardBuilder

Builds a complete multi-category dashboard.

#### Methods

```cpp
FullDashboardBuilder& addCategory(const std::string& category,
                                  const epoch_proto::TearSheet& dashboard);
FullDashboardBuilder& addCategoryBuilder(const std::string& category,
                                         const DashboardBuilder& builder);
epoch_proto::FullTearSheet build() const;
```

#### Example

```cpp
// Build performance dashboard
auto perf_dashboard = DashboardBuilder()
    .setCategory("Performance")
    .addCard(returns_card)
    .addChart(equity_curve)
    .build();

// Build risk dashboard
auto risk_dashboard = DashboardBuilder()
    .setCategory("Risk")
    .addCard(sharpe_card)
    .addChart(drawdown_chart)
    .build();

// Combine into full dashboard
auto full_dashboard = FullDashboardBuilder()
    .addCategoryBuilder("Performance", perf_dashboard)
    .addCategoryBuilder("Risk", risk_dashboard)
    .build();
```

## Complete Examples

### Example 1: Portfolio Performance Dashboard

```cpp
#include <epoch_dashboard/tearsheet/tearsheet_builder.h>
#include <epoch_dashboard/tearsheet/card_builder.h>
#include <epoch_dashboard/tearsheet/lines_chart_builder.h>
#include <epoch_dashboard/tearsheet/table_builder.h>
#include <epoch_dashboard/tearsheet/scalar_converter.h>

using namespace epoch_tearsheet;

// Load your data
DataFrame performance_df = loadPerformanceData();
DataFrame holdings_df = loadHoldingsData();

// Create performance cards
auto returns_card = CardBuilder()
    .setType(epoch_proto::WidgetCard)
    .setCategory("Returns")
    .addCardData(
        CardDataBuilder()
            .setTitle("Total Return")
            .setValue(ScalarFactory::fromDecimal(47.8))
            .setType(epoch_proto::TypeDecimal)
            .build()
    )
    .addCardData(
        CardDataBuilder()
            .setTitle("Annual Return")
            .setValue(ScalarFactory::fromDecimal(15.2))
            .setType(epoch_proto::TypeDecimal)
            .build()
    )
    .setGroupSize(2)
    .build();

// Create equity curve chart
auto equity_chart = LinesChartBuilder()
    .setTitle("Equity Curve")
    .setCategory("Performance")
    .setXAxisLabel("Date")
    .setYAxisLabel("Portfolio Value")
    .fromDataFrame(performance_df, "date", {"portfolio", "benchmark"})
    .build();

// Create holdings table
auto holdings_table = TableBuilder()
    .setTitle("Current Holdings")
    .setCategory("Portfolio")
    .fromDataFrame(holdings_df, {"symbol", "quantity", "value", "weight"})
    .build();

// Build complete dashboard
auto dashboard = DashboardBuilder()
    .setCategory("Portfolio Overview")
    .addCard(returns_card)
    .addChart(equity_chart)
    .addTable(holdings_table)
    .build();
```

### Example 2: Risk Analysis Dashboard

```cpp
// Create risk metrics card
auto risk_card = CardBuilder()
    .setType(epoch_proto::WidgetCard)
    .setCategory("Risk Metrics")
    .addCardData(
        CardDataBuilder()
            .setTitle("Sharpe Ratio")
            .setValue(ScalarFactory::fromDecimal(1.85))
            .build()
    )
    .addCardData(
        CardDataBuilder()
            .setTitle("Max Drawdown")
            .setValue(ScalarFactory::fromDecimal(-12.3))
            .build()
    )
    .addCardData(
        CardDataBuilder()
            .setTitle("Volatility")
            .setValue(ScalarFactory::fromDecimal(15.7))
            .build()
    )
    .build();

// Create return distribution histogram
auto dist_chart = HistogramChartBuilder()
    .setTitle("Return Distribution")
    .setCategory("Risk")
    .setXAxisLabel("Daily Return (%)")
    .setYAxisLabel("Frequency")
    .fromDataFrame(returns_df, "daily_return", 50)
    .build();

// Create drawdown chart
auto dd_chart = LinesChartBuilder()
    .setTitle("Drawdown Chart")
    .setCategory("Risk")
    .setYAxisLabel("Drawdown (%)")
    .fromDataFrame(performance_df, "date", {"drawdown"})
    .build();

// Build risk dashboard
auto risk_dashboard = DashboardBuilder()
    .setCategory("Risk Analysis")
    .addCard(risk_card)
    .addChart(dist_chart)
    .addChart(dd_chart)
    .build();
```

### Example 3: Multi-Category Dashboard

```cpp
// Performance category
auto perf_builder = DashboardBuilder()
    .setCategory("Performance")
    .addCard(returns_card)
    .addChart(equity_chart);

// Risk category
auto risk_builder = DashboardBuilder()
    .setCategory("Risk")
    .addCard(risk_card)
    .addChart(distribution_chart);

// Holdings category
auto holdings_builder = DashboardBuilder()
    .setCategory("Holdings")
    .addTable(holdings_table)
    .addChart(allocation_pie_chart);

// Build complete multi-category dashboard
auto full_dashboard = FullDashboardBuilder()
    .addCategoryBuilder("Performance", perf_builder)
    .addCategoryBuilder("Risk", risk_builder)
    .addCategoryBuilder("Holdings", holdings_builder)
    .build();

// Serialize to protobuf
std::string serialized;
full_dashboard.SerializeToString(&serialized);
```

## Important Notes

### Safe Scalar Conversion

When converting `epoch_frame::Scalar` to `epoch_proto::Scalar`, always use the safe casting pattern:

```cpp
// ✅ CORRECT - Safe casting
if (auto bool_val = scalar.cast(arrow::boolean()).as_bool()) {
    result.set_boolean_value(bool_val);
}

if (auto int_val = scalar.cast(arrow::int64()).as_int64()) {
    result.set_integer_value(int_val);
}

if (auto double_val = scalar.cast(arrow::float64()).as_double()) {
    result.set_decimal_value(double_val);
}

// ❌ INCORRECT - Unsafe, will throw if type doesn't match
result.set_boolean_value(scalar.as_bool());  // Don't do this!
```

### DataFrame Column Selection

When using `TableBuilder::fromDataFrame()` with column selection, the builder will:
1. Only include the specified columns in the output
2. Maintain the order of columns as specified
3. Only extract data for the selected columns (performance optimization)

```cpp
// Select specific columns
auto table = TableBuilder()
    .setTitle("Key Metrics")
    .fromDataFrame(df, {"Symbol", "Price", "Change", "Volume"})
    .build();
```

## Testing

Run the test suite:

```bash
./cmake-build-debug/bin/epoch_dashboard_test
```

Run specific builder tests:

```bash
./cmake-build-debug/bin/epoch_dashboard_test "[table]"
./cmake-build-debug/bin/epoch_dashboard_test "[bar]"
./cmake-build-debug/bin/epoch_dashboard_test "[lines]"
./cmake-build-debug/bin/epoch_dashboard_test "[pie]"
./cmake-build-debug/bin/epoch_dashboard_test "[histogram]"
```

## License

Copyright (c) Epoch Labs. All rights reserved.