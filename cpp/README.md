# EpochDashboard C++ Library

A high-performance C++ library for building interactive financial dashboards, charts, and tear sheets with Protocol Buffer support. This library provides a fluent builder API for creating various chart types and data visualizations commonly used in quantitative finance and data analysis.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [System Requirements](#system-requirements)
  - [Installing Dependencies](#installing-dependencies)
  - [Building from Source](#building-from-source)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
  - [Design Patterns](#design-patterns)
  - [Class Hierarchy](#class-hierarchy)
  - [Project Structure](#project-structure)
- [Chart Builders](#chart-builders)
  - [Common Methods (Inherited)](#common-methods-inherited)
  - [Area Chart](#area-chart)
  - [Bar Chart](#bar-chart)
  - [Line Chart](#line-chart)
  - [Histogram](#histogram)
  - [Heat Map](#heat-map)
  - [Box Plot](#box-plot)
  - [XRange Chart](#xrange-chart)
  - [Pie Chart](#pie-chart)
- [Data Utilities](#data-utilities)
  - [ScalarFactory](#scalarfactory)
  - [TableBuilder](#tablebuilder)
  - [CardBuilder](#cardbuilder)
  - [LineBuilder](#linebuilder)
- [Data Integration](#data-integration)
  - [DataFrame Support](#dataframe-support)
  - [Series Support](#series-support)
- [Dashboard Composition](#dashboard-composition)
  - [TearSheetBuilder](#tearsheetbuilder)
  - [Full Dashboard Example](#full-dashboard-example)
- [Advanced Usage](#advanced-usage)
  - [Custom Styling](#custom-styling)
  - [Real-time Updates](#real-time-updates)
  - [Performance Optimization](#performance-optimization)
- [Testing](#testing)
  - [Running Tests](#running-tests)
  - [Writing Tests](#writing-tests)
  - [Coverage Report](#coverage-report)
- [API Reference](#api-reference)
  - [Enumerations](#enumerations)
  - [Type Definitions](#type-definitions)
  - [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Examples](#examples)
- [License](#license)

## Features

- **Type-Safe Builder Pattern**: Fluent API with compile-time type safety and method chaining
- **Protocol Buffer Integration**: Efficient serialization for network transmission and storage
- **Comprehensive Chart Types**: 8+ chart types including Line, Area, Bar, Histogram, HeatMap, BoxPlot, XRange, and Pie
- **DataFrame & Series Support**: Seamless integration with Apache Arrow-based DataFrames
- **Template-Based Inheritance**: CRTP design pattern for zero-overhead abstraction
- **High Performance**: Optimized for large-scale financial data processing
- **Extensible Architecture**: Easy to add new chart types and features
- **Comprehensive Testing**: 100+ test cases with Catch2 framework
- **Thread-Safe**: Builders can be used in multi-threaded environments

## Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+), macOS (11+), Windows (10+)
- **Memory**: Minimum 4GB RAM (8GB+ recommended for large datasets)
- **Disk Space**: 2GB for dependencies and build artifacts

### Software Dependencies
- **C++ Compiler**: C++23 compatible
  - GCC 12+
  - Clang 15+
  - MSVC 2022+ (Windows)
- **Build Tools**:
  - CMake 3.20 or higher
  - Make or Ninja
  - vcpkg (for dependency management)
- **Required Libraries**:
  - Protocol Buffers 3.21+
  - Apache Arrow 10.0+
  - Catch2 3.0+ (for testing)
  - spdlog 1.11+ (for logging)
  - AWS SDK C++ (optional, for cloud features)
  - glaze (JSON serialization)

## Installation

### System Requirements

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    cmake \
    git \
    curl \
    zip \
    unzip \
    tar \
    pkg-config \
    ninja-build
```

#### macOS
```bash
brew install cmake ninja git
```

#### Windows
Install Visual Studio 2022 with C++ development tools and CMake support.

### Installing Dependencies

#### 1. Install vcpkg
```bash
# Clone vcpkg
git clone https://github.com/Microsoft/vcpkg.git ~/vcpkg
cd ~/vcpkg

# Bootstrap vcpkg
./bootstrap-vcpkg.sh  # Linux/macOS
# or
.\bootstrap-vcpkg.bat  # Windows

# Add to PATH
export VCPKG_ROOT=~/vcpkg
export PATH=$VCPKG_ROOT:$PATH
```

#### 2. Install Dependencies via vcpkg
```bash
vcpkg install \
    protobuf \
    arrow \
    catch2 \
    spdlog \
    glaze \
    aws-sdk-cpp[s3,dynamodb]
```

### Building from Source

#### 1. Clone the Repository
```bash
git clone https://github.com/epochlab/EpochDashboard.git
cd EpochDashboard/cpp
```

#### 2. Configure with CMake
```bash
# Create build directory
mkdir build && cd build

# Configure with vcpkg toolchain
cmake .. \
    -DCMAKE_TOOLCHAIN_FILE=$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_TEST=ON \
    -DBUILD_SHARED_LIBS=ON

# For Debug build with coverage
cmake .. \
    -DCMAKE_TOOLCHAIN_FILE=$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake \
    -DCMAKE_BUILD_TYPE=Debug \
    -DBUILD_TEST=ON \
    -DENABLE_COVERAGE=ON
```

#### 3. Build the Library
```bash
# Build with all cores
cmake --build . -j$(nproc)  # Linux
cmake --build . -j$(sysctl -n hw.ncpu)  # macOS
cmake --build . -j  # Windows

# Or with specific target
cmake --build . --target epoch_dashboard -j30

# Using CLion/JetBrains tools
/path/to/clion/bin/cmake/linux/x64/bin/cmake \
    --build cmake-build-debug \
    --target epoch_dashboard_test -j30
```

#### 4. Install (Optional)
```bash
sudo cmake --install .
# Installs to /usr/local by default

# Or specify custom prefix
cmake --install . --prefix ~/my_install_dir
```

#### 5. Verify Installation
```bash
# Run tests
./build/bin/epoch_dashboard_test

# Check library
ls -la build/lib/libepoch_dashboard.*
```

## Quick Start

### Basic Example: Creating a Line Chart

```cpp
#include <epoch_dashboard/tearsheet/lines_chart_builder.h>
#include <epoch_dashboard/tearsheet/line_builder.h>

using namespace epoch_tearsheet;

int main() {
    // Create a line with data points
    auto line = LineBuilder()
        .setName("Stock Price")
        .addPoint(1609459200000, 100.0)  // Jan 1, 2021
        .addPoint(1609545600000, 102.5)  // Jan 2, 2021
        .addPoint(1609632000000, 101.3)  // Jan 3, 2021
        .setDashStyle(epoch_proto::Solid)
        .setLineWidth(2)
        .build();

    // Build the chart
    auto chart = LinesChartBuilder()
        .setId("stock-price-chart")
        .setTitle("Stock Price Over Time")
        .setCategory("Equities")
        .setXAxisLabel("Date")
        .setYAxisLabel("Price ($)")
        .setXAxisType(epoch_proto::AxisDateTime)
        .setYAxisType(epoch_proto::AxisLinear)
        .addLine(line)
        .build();

    // Serialize to Protocol Buffer
    std::string serialized = chart.SerializeAsString();

    // Send to frontend or save to file
    sendToFrontend(serialized);

    return 0;
}
```

### Creating a Complete Dashboard

```cpp
#include <epoch_dashboard/tearsheet/tearsheet_builder.h>
#include <epoch_dashboard/tearsheet/card_builder.h>
#include <epoch_dashboard/tearsheet/table_builder.h>

int main() {
    // Create metrics card
    auto metricsCard = CardBuilder()
        .setType(epoch_proto::WidgetCard)
        .setCategory("Performance")
        .addCardData(
            CardDataBuilder()
                .setTitle("Total Return")
                .setValue(ScalarFactory::fromDecimal(47.8))
                .setType(epoch_proto::TypePercent)
                .build()
        )
        .build();

    // Create holdings table from DataFrame
    DataFrame df = loadHoldingsData();
    auto table = TableBuilder()
        .setTitle("Current Holdings")
        .fromDataFrame(df, {"Symbol", "Quantity", "Value", "Weight"})
        .build();

    // Build complete dashboard
    auto tearsheet = TearSheetBuilder()
        .setTitle("Portfolio Dashboard")
        .addCard(metricsCard)
        .addTable(table)
        .addChart(chart)
        .build();

    return 0;
}
```

## Architecture

### Design Patterns

The library employs several advanced design patterns:

1. **Builder Pattern**: All chart types use builders for flexible, readable object construction
2. **CRTP (Curiously Recurring Template Pattern)**: Zero-overhead base class functionality
3. **Factory Pattern**: Data conversion factories for DataFrame and Series
4. **Facade Pattern**: Simplified interface for complex chart configurations
5. **Strategy Pattern**: Different data conversion strategies based on input type

### Class Hierarchy

```
ChartBuilderBase<T> (CRTP Template Base)
    ├── AreaChartBuilder
    ├── BarChartBuilder
    ├── LinesChartBuilder
    ├── HistogramChartBuilder
    ├── HeatMapChartBuilder
    ├── BoxPlotChartBuilder
    ├── XRangeChartBuilder
    └── PieChartBuilder

Data Builders:
    ├── LineBuilder
    ├── CardDataBuilder
    ├── CardBuilder
    ├── ColumnBuilder
    └── TableBuilder

Utility Classes:
    ├── ScalarFactory
    ├── SeriesFactory
    └── DataFrameFactory
```

### Project Structure

```
cpp/
├── include/epoch_dashboard/tearsheet/
│   ├── chart_builder_base.h         # CRTP base template
│   ├── area_chart_builder.h         # Area chart builder
│   ├── bar_chart_builder.h          # Bar chart builder
│   ├── lines_chart_builder.h        # Lines chart builder
│   ├── histogram_chart_builder.h    # Histogram builder
│   ├── heatmap_chart_builder.h      # Heat map builder
│   ├── boxplot_chart_builder.h      # Box plot builder
│   ├── xrange_chart_builder.h       # XRange builder
│   ├── pie_chart_builder.h          # Pie chart builder
│   ├── line_builder.h               # Line data builder
│   ├── table_builder.h              # Table builder
│   ├── card_builder.h               # Card widget builder
│   ├── tearsheet_builder.h          # Dashboard composer
│   ├── scalar_converter.h           # Scalar utilities
│   ├── series_converter.h           # Series utilities
│   └── dataframe_converter.h        # DataFrame utilities
├── src/tearsheet/builders/
│   ├── area_chart_builder.cpp       # Implementations
│   ├── bar_chart_builder.cpp
│   ├── lines_chart_builder.cpp
│   └── ...
├── tests/
│   ├── test_area_chart_builder.cpp  # Unit tests
│   ├── test_bar_chart_builder.cpp
│   ├── test_chart_builder_base.cpp
│   └── ...
├── thirdparty/
│   └── epoch_protos/                # Protocol buffer definitions
├── CMakeLists.txt                   # Main build config
├── vcpkg.json                       # Dependencies manifest
└── README.md                        # This file
```

## Chart Builders

### Common Methods (Inherited)

All chart builders inherit these methods from `ChartBuilderBase<T>`:

```cpp
// Identification and Metadata
Builder& setId(const std::string& id);
Builder& setTitle(const std::string& title);
Builder& setCategory(const std::string& category);

// Axis Configuration
Builder& setXAxisLabel(const std::string& label);
Builder& setYAxisLabel(const std::string& label);
Builder& setXAxisType(epoch_proto::AxisType type);
Builder& setYAxisType(epoch_proto::AxisType type);
Builder& setXAxisCategories(const std::vector<std::string>& categories);
Builder& setYAxisCategories(const std::vector<std::string>& categories);

// Build Method
epoch_proto::Chart build() const;
```

### Area Chart

Area charts are perfect for showing cumulative totals and trends over time.

```cpp
#include <epoch_dashboard/tearsheet/area_chart_builder.h>

// Create stacked area chart
auto chart = AreaChartBuilder()
    .setTitle("Revenue Breakdown")
    .setCategory("Financial")
    .setXAxisType(epoch_proto::AxisDateTime)
    .setYAxisType(epoch_proto::AxisLinear)
    .addArea(productRevenue)
    .addArea(serviceRevenue)
    .addArea(subscriptionRevenue)
    .setStacked(true)
    .setStackType(epoch_proto::StackTypePercent)  // Show as percentage
    .build();
```

**Key Methods:**
- `addArea(const Line&)`: Add an area series
- `addAreas(const vector<Line>&)`: Add multiple areas at once
- `setStacked(bool)`: Enable/disable stacking
- `setStackType(StackType)`: Normal or Percent stacking
- `fromDataFrame(df, x_col, y_cols)`: Create from DataFrame

### Bar Chart

Bar charts support both vertical and horizontal orientations with stacking.

```cpp
#include <epoch_dashboard/tearsheet/bar_chart_builder.h>

// Create stacked bar chart with categories
epoch_proto::BarData revenue, costs, profit;
revenue.set_name("Revenue");
revenue.add_values(100.0);
revenue.add_values(120.0);
revenue.add_values(140.0);
revenue.set_stack("financial");

auto chart = BarChartBuilder()
    .setTitle("Quarterly Performance")
    .setXAxisType(epoch_proto::AxisCategory)
    .setXAxisCategories({"Q1", "Q2", "Q3", "Q4"})
    .addBarData(revenue)
    .addBarData(costs)
    .addBarData(profit)
    .setStacked(true)
    .setStackType(epoch_proto::StackTypeNormal)
    .setBarWidth(40)
    .build();
```

**Key Methods:**
- `addBarData(const BarData&)`: Add bar series with multiple values
- `setData(const Array&)`: Legacy method for single series
- `setVertical(bool)`: Toggle vertical/horizontal
- `setStacked(bool)`: Enable stacking
- `setStackType(StackType)`: Stacking mode
- `setBarWidth(uint32_t)`: Bar width in pixels
- `addStraightLine(const StraightLineDef&)`: Add reference line

### Line Chart

Line charts support multiple series, overlays, and plot bands.

```cpp
#include <epoch_dashboard/tearsheet/lines_chart_builder.h>

// Create multi-series line chart with bands
epoch_proto::Band recessionBand;
*recessionBand.mutable_from() = ScalarFactory::fromInteger(1580515200000);
*recessionBand.mutable_to() = ScalarFactory::fromInteger(1590969600000);

epoch_proto::StraightLineDef targetLine;
targetLine.set_title("Target Return");
targetLine.set_value(10.0);
targetLine.set_vertical(false);

auto chart = LinesChartBuilder()
    .setTitle("Portfolio vs Benchmark")
    .addLine(portfolioLine)
    .addLine(benchmarkLine)
    .setOverlay(movingAverage)  // Overlay another line
    .addYPlotBand(recessionBand)
    .addStraightLine(targetLine)
    .setStacked(false)
    .build();
```

**Key Methods:**
- `addLine(const Line&)`: Add a line series
- `addLines(const vector<Line>&)`: Add multiple lines
- `setOverlay(const Line&)`: Set overlay line
- `addStraightLine(const StraightLineDef&)`: Add horizontal/vertical line
- `addYPlotBand(const Band&)`: Add horizontal band
- `addXPlotBand(const Band&)`: Add vertical band
- `setStacked(bool)`: Enable line stacking

### Histogram

Histograms visualize data distributions with configurable bins.

```cpp
#include <epoch_dashboard/tearsheet/histogram_chart_builder.h>

// Create return distribution histogram
epoch_proto::StraightLineDef meanLine;
meanLine.set_title("Mean");
meanLine.set_value(calculateMean(returns));
meanLine.set_vertical(true);

auto chart = HistogramChartBuilder()
    .setTitle("Daily Return Distribution")
    .setCategory("Risk Analysis")
    .setXAxisLabel("Return (%)")
    .setYAxisLabel("Frequency")
    .fromDataFrame(df, "daily_returns", 50)  // 50 bins
    .addStraightLine(meanLine)
    .build();
```

**Key Methods:**
- `setData(const Array&)`: Set histogram data
- `setBinsCount(uint32_t)`: Number of bins
- `addStraightLine(const StraightLineDef&)`: Add reference line
- `fromSeries(const Series&, bins)`: Create from Series
- `fromDataFrame(df, column, bins)`: Create from DataFrame column

### Heat Map

Heat maps visualize matrix data with color intensity.

```cpp
#include <epoch_dashboard/tearsheet/heatmap_chart_builder.h>

// Create correlation matrix heat map
auto heatmap = HeatMapChartBuilder()
    .setTitle("Asset Correlation Matrix")
    .setXAxisType(epoch_proto::AxisCategory)
    .setYAxisType(epoch_proto::AxisCategory)
    .setXAxisCategories({"AAPL", "GOOGL", "MSFT", "AMZN"})
    .setYAxisCategories({"AAPL", "GOOGL", "MSFT", "AMZN"})
    .addPoint(0, 0, 1.00)   // AAPL-AAPL
    .addPoint(0, 1, 0.85)   // AAPL-GOOGL
    .addPoint(0, 2, 0.78)   // AAPL-MSFT
    .addPoint(0, 3, 0.82)   // AAPL-AMZN
    // ... add more points
    .build();
```

**Key Methods:**
- `addPoint(x, y, value)`: Add single heat map point
- `addPoints(const vector<HeatMapPoint>&)`: Add multiple points

### Box Plot

Box plots show statistical distributions with quartiles and outliers.

```cpp
#include <epoch_dashboard/tearsheet/boxplot_chart_builder.h>

// Create box plot for strategy returns
epoch_proto::BoxPlotDataPoint dataPoint;
dataPoint.set_low(returns.min());
dataPoint.set_q1(returns.percentile(25));
dataPoint.set_median(returns.percentile(50));
dataPoint.set_q3(returns.percentile(75));
dataPoint.set_high(returns.max());

// Add outliers
for (auto outlier : detectOutliers(returns)) {
    epoch_proto::BoxPlotOutlier o;
    o.set_category_index(0);
    o.set_value(outlier);
    builder.addOutlier(o);
}

auto chart = BoxPlotChartBuilder()
    .setTitle("Return Distribution by Strategy")
    .setXAxisType(epoch_proto::AxisCategory)
    .setXAxisCategories({"Strategy A", "Strategy B", "Strategy C"})
    .addDataPoint(dataPoint)
    .build();
```

**Key Methods:**
- `addDataPoint(const BoxPlotDataPoint&)`: Add box plot data
- `addOutlier(const BoxPlotOutlier&)`: Add outlier point

### XRange Chart

XRange charts (Gantt-style) show time ranges and durations.

```cpp
#include <epoch_dashboard/tearsheet/xrange_chart_builder.h>

// Create trade duration visualization
auto chart = XRangeChartBuilder()
    .setTitle("Position Timeline")
    .setXAxisType(epoch_proto::AxisDateTime)
    .setYAxisType(epoch_proto::AxisCategory)
    .addCategory("AAPL Long")
    .addCategory("GOOGL Short")
    .addCategory("MSFT Long")
    .addPoint(1609459200000, 1612137600000, 0, true)   // AAPL position
    .addPoint(1610668800000, 1611878400000, 1, false)  // GOOGL position
    .addPoint(1612742400000, 1614556800000, 2, true)   // MSFT position
    .build();
```

**Key Methods:**
- `addCategory(const string&)`: Add Y-axis category
- `addPoint(x_start, x_end, y_index, is_long)`: Add time range
- `addPoint(const XRangePoint&)`: Add pre-built point

### Pie Chart

Pie and donut charts for composition visualization.

```cpp
#include <epoch_dashboard/tearsheet/pie_chart_builder.h>
#include <epoch_dashboard/tearsheet/chart_types.h>

// Create donut chart
vector<epoch_proto::PieData> allocation;
allocation.push_back(createPieData("Equities", 60.0));
allocation.push_back(createPieData("Bonds", 25.0));
allocation.push_back(createPieData("Commodities", 10.0));
allocation.push_back(createPieData("Cash", 5.0));

auto chart = PieChartBuilder()
    .setTitle("Asset Allocation")
    .addSeries(
        "Current Allocation",
        allocation,
        PieSize::percentage(80),           // 80% of container
        PieInnerSize::percentage(40)       // 40% inner hole (donut)
    )
    .build();
```

**Key Methods:**
- `addSeries(name, points, size, inner_size)`: Add pie series
- `fromDataFrame(df, name_col, value_col, ...)`: Create from DataFrame

## Data Utilities

### ScalarFactory

Factory for creating type-safe scalar values.

```cpp
#include <epoch_dashboard/tearsheet/scalar_converter.h>

// Create different scalar types
auto boolVal = ScalarFactory::fromBool(true);
auto intVal = ScalarFactory::fromInteger(42);
auto decimalVal = ScalarFactory::fromDecimal(3.14159);
auto stringVal = ScalarFactory::fromString("Active");
auto timestampVal = ScalarFactory::fromTimestamp(
    std::chrono::milliseconds(1609459200000)
);
auto nullVal = ScalarFactory::null();

// Convert from epoch_frame::Scalar (safe pattern)
epoch_frame::Scalar frameScalar(123.45);
auto protoScalar = ScalarFactory::create(frameScalar);
```

### TableBuilder

Creates tables from DataFrames or manual construction.

```cpp
#include <epoch_dashboard/tearsheet/table_builder.h>

// From DataFrame with column selection
auto table = TableBuilder()
    .setTitle("Top Holdings")
    .setType(epoch_proto::WidgetDataTable)
    .fromDataFrame(df, {"Symbol", "Shares", "Value", "Weight"})
    .build();

// Manual construction
auto customTable = TableBuilder()
    .setTitle("Performance Metrics")
    .addColumn("metric", "Metric", epoch_proto::TypeString)
    .addColumn("value", "Value", epoch_proto::TypeDecimal)
    .addColumn("rank", "Rank", epoch_proto::TypeInteger)
    .build();
```

### CardBuilder

Creates card widgets for key metrics display.

```cpp
#include <epoch_dashboard/tearsheet/card_builder.h>

// Multi-metric card with grouping
auto card = CardBuilder()
    .setType(epoch_proto::WidgetCard)
    .setCategory("Risk Metrics")
    .setGroupSize(2)  // 2 items per row
    .addCardData(
        CardDataBuilder()
            .setTitle("Sharpe Ratio")
            .setValue(ScalarFactory::fromDecimal(1.85))
            .setType(epoch_proto::TypeDecimal)
            .setGroup(0)
            .build()
    )
    .addCardData(
        CardDataBuilder()
            .setTitle("Sortino Ratio")
            .setValue(ScalarFactory::fromDecimal(2.31))
            .setType(epoch_proto::TypeDecimal)
            .setGroup(0)
            .build()
    )
    .build();
```

### LineBuilder

Constructs line data for charts.

```cpp
#include <epoch_dashboard/tearsheet/line_builder.h>

// Create styled line with points
auto line = LineBuilder()
    .setName("Portfolio NAV")
    .setDashStyle(epoch_proto::Solid)
    .setLineWidth(2)
    .addPoint(1609459200000, 1000000.0)
    .addPoint(1609545600000, 1002500.0)
    .addPoint(1609632000000, 1001300.0)
    .addPoints(morePoints)  // Add vector of points
    .build();
```

## Data Integration

### DataFrame Support

The library seamlessly integrates with Apache Arrow DataFrames.

```cpp
#include <epoch_frame/dataframe.h>

// Load DataFrame
DataFrame df = DataFrame::from_csv("data.csv");

// Create chart from DataFrame columns
auto chart = LinesChartBuilder()
    .setTitle("Time Series Data")
    .fromDataFrame(df, "timestamp", {"value1", "value2", "value3"})
    .build();

// Create table with specific columns
auto table = TableBuilder()
    .setTitle("Data Summary")
    .fromDataFrame(df, {"id", "name", "value", "status"})
    .build();

// Create histogram from single column
auto histogram = HistogramChartBuilder()
    .setTitle("Value Distribution")
    .fromDataFrame(df, "values", 30)  // 30 bins
    .build();
```

### Series Support

Work with single-column Series data.

```cpp
#include <epoch_frame/series.h>

// Create chart from Series
Series returns = df["daily_returns"];
auto histogram = HistogramChartBuilder()
    .setTitle("Return Distribution")
    .fromSeries(returns, 50)
    .build();

// Create bar chart from Series
Series sales = df["monthly_sales"];
auto barChart = BarChartBuilder()
    .setTitle("Monthly Sales")
    .fromSeries(sales)
    .build();
```

## Dashboard Composition

### TearSheetBuilder

Compose complete dashboards with multiple widgets.

```cpp
#include <epoch_dashboard/tearsheet/tearsheet_builder.h>

// Build comprehensive dashboard
auto dashboard = TearSheetBuilder()
    .setTitle("Trading Strategy Dashboard")
    .setCategory("Overview")

    // Add metric cards
    .addCard(performanceCard)
    .addCard(riskCard)

    // Add charts
    .addChart(equityCurve)
    .addChart(drawdownChart)
    .addChart(returnsHistogram)

    // Add data tables
    .addTable(holdingsTable)
    .addTable(tradesTable)

    .build();

// Serialize for transmission
std::string serialized = dashboard.SerializeAsString();
```

### Full Dashboard Example

Complete multi-category dashboard:

```cpp
// Performance Section
auto perfCards = CardBuilder()
    .setCategory("Performance")
    .addCardData(totalReturn)
    .addCardData(annualReturn)
    .addCardData(monthlyReturn)
    .build();

auto perfChart = LinesChartBuilder()
    .setTitle("Cumulative Returns")
    .fromDataFrame(df, "date", {"strategy", "benchmark"})
    .build();

// Risk Section
auto riskCards = CardBuilder()
    .setCategory("Risk")
    .addCardData(sharpeRatio)
    .addCardData(maxDrawdown)
    .addCardData(volatility)
    .build();

auto riskChart = HistogramChartBuilder()
    .setTitle("Return Distribution")
    .fromDataFrame(df, "returns", 50)
    .build();

// Holdings Section
auto holdingsTable = TableBuilder()
    .setTitle("Current Holdings")
    .fromDataFrame(holdings_df)
    .build();

auto allocationChart = PieChartBuilder()
    .setTitle("Sector Allocation")
    .fromDataFrame(holdings_df, "sector", "weight", "Allocation",
                   PieSize::percentage(75))
    .build();

// Compose full dashboard
auto fullDashboard = TearSheetBuilder()
    .setTitle("Strategy Performance Review")

    // Performance section
    .addCard(perfCards)
    .addChart(perfChart)

    // Risk section
    .addCard(riskCards)
    .addChart(riskChart)

    // Holdings section
    .addTable(holdingsTable)
    .addChart(allocationChart)

    .build();
```

## Advanced Usage

### Custom Styling

Apply custom styles to charts and components:

```cpp
// Custom line styling
auto styledLine = LineBuilder()
    .setName("Moving Average (20)")
    .setDashStyle(epoch_proto::ShortDash)
    .setLineWidth(3)
    .setColor("#FF5733")  // Custom hex color
    .build();

// Custom plot bands with colors
epoch_proto::Band profitZone;
*profitZone.mutable_from() = ScalarFactory::fromDecimal(0.0);
*profitZone.mutable_to() = ScalarFactory::fromDecimal(100.0);
profitZone.set_color("#E8F5E9");  // Light green
profitZone.set_label("Profit Zone");

// Reference lines with styles
epoch_proto::StraightLineDef breakeven;
breakeven.set_title("Breakeven");
breakeven.set_value(0.0);
breakeven.set_color("#FF0000");
breakeven.set_width(2);
breakeven.set_dash_style(epoch_proto::Dash);
```

### Real-time Updates

Build charts that update with streaming data:

```cpp
class RealtimeChartManager {
private:
    std::vector<epoch_proto::Point> dataBuffer;
    std::mutex bufferMutex;
    const size_t maxPoints = 1000;

public:
    void addDataPoint(int64_t timestamp, double value) {
        std::lock_guard<std::mutex> lock(bufferMutex);

        epoch_proto::Point point;
        point.set_x(timestamp);
        point.set_y(value);
        dataBuffer.push_back(point);

        // Maintain sliding window
        if (dataBuffer.size() > maxPoints) {
            dataBuffer.erase(dataBuffer.begin());
        }
    }

    epoch_proto::Chart getCurrentChart() {
        std::lock_guard<std::mutex> lock(bufferMutex);

        auto line = LineBuilder()
            .setName("Real-time Data")
            .addPoints(dataBuffer)
            .build();

        return LinesChartBuilder()
            .setTitle("Live Market Data")
            .setXAxisType(epoch_proto::AxisDateTime)
            .addLine(line)
            .build();
    }
};
```

### Performance Optimization

Tips for handling large datasets efficiently:

```cpp
// Pre-allocate memory for better performance
std::vector<epoch_proto::Point> points;
points.reserve(1000000);  // Reserve for 1M points

// Batch operations
std::vector<epoch_proto::Line> lines;
lines.reserve(10);

for (const auto& series : dataSeries) {
    lines.push_back(
        LineBuilder()
            .setName(series.name)
            .addPoints(series.points)  // Batch add
            .build()
    );
}

auto chart = LinesChartBuilder()
    .setTitle("Multi-Series Chart")
    .addLines(lines)  // Add all lines at once
    .build();

// Use move semantics
auto largeData = generateLargeDataset();
builder.addPoints(std::move(largeData));  // Avoid copy

// Reuse builders for similar charts
LinesChartBuilder reusableBuilder;
for (const auto& config : chartConfigs) {
    auto chart = reusableBuilder
        .setTitle(config.title)
        .setCategory(config.category)
        .addLine(config.line)
        .build();
    processChart(chart);
}
```

## Testing

### Running Tests

```bash
# Run all tests
./build/bin/epoch_dashboard_test

# Run with detailed output
./build/bin/epoch_dashboard_test --success --reporter console

# Run specific test suite
./build/bin/epoch_dashboard_test "[area]"     # Area chart tests
./build/bin/epoch_dashboard_test "[bar]"      # Bar chart tests
./build/bin/epoch_dashboard_test "[base]"     # Base class tests

# Run tests matching pattern
./build/bin/epoch_dashboard_test "ChartBuilderBase*"

# List all available tests
./build/bin/epoch_dashboard_test --list-tests

# Run with JUnit output for CI
./build/bin/epoch_dashboard_test --reporter junit --out results.xml
```

### Writing Tests

Example test structure using Catch2:

```cpp
#include <catch2/catch_test_macros.hpp>
#include <epoch_dashboard/tearsheet/bar_chart_builder.h>

TEST_CASE("BarChartBuilder: Basic functionality", "[bar]") {
    SECTION("Creates chart with title") {
        auto chart = BarChartBuilder()
            .setTitle("Test Chart")
            .build();

        REQUIRE(chart.has_bar_def());
        REQUIRE(chart.bar_def().chart_def().title() == "Test Chart");
    }

    SECTION("Handles stacking configuration") {
        auto chart = BarChartBuilder()
            .setStacked(true)
            .setStackType(epoch_proto::StackTypePercent)
            .build();

        REQUIRE(chart.bar_def().stacked() == true);
        REQUIRE(chart.bar_def().stack_type() == epoch_proto::StackTypePercent);
    }

    SECTION("Processes DataFrame input") {
        DataFrame df = createTestDataFrame();
        auto chart = BarChartBuilder()
            .fromDataFrame(df, "values")
            .build();

        REQUIRE(chart.bar_def().data_size() > 0);
    }
}
```

### Coverage Report

Generate test coverage reports:

```bash
# Build with coverage enabled
cmake .. -DENABLE_COVERAGE=ON -DCMAKE_BUILD_TYPE=Debug
cmake --build .

# Run tests
./bin/epoch_dashboard_test

# Generate coverage report
gcov src/tearsheet/builders/*.cpp
lcov --capture --directory . --output-file coverage.info
genhtml coverage.info --output-directory coverage_report

# View report
firefox coverage_report/index.html
```

## API Reference

### Enumerations

#### AxisType
```cpp
enum AxisType {
    AxisUnspecified = 0,
    AxisLinear = 1,        // Linear scale
    AxisLogarithmic = 2,   // Logarithmic scale
    AxisDateTime = 3,      // Time-based axis
    AxisCategory = 4       // Categorical axis
}
```

#### StackType
```cpp
enum StackType {
    StackTypeUnspecified = 0,
    StackTypeNormal = 1,   // Absolute stacking
    StackTypePercent = 2   // Percentage stacking (100%)
}
```

#### DashStyle
```cpp
enum DashStyle {
    DashStyleUnspecified = 0,
    Solid = 1,
    ShortDash = 2,
    ShortDot = 3,
    ShortDashDot = 4,
    ShortDashDotDot = 5,
    Dot = 6,
    Dash = 7,
    LongDash = 8,
    DashDot = 9,
    LongDashDot = 10,
    LongDashDotDot = 11
}
```

#### EpochFolioType
```cpp
enum EpochFolioType {
    TypeUnspecified = 0,
    TypeString = 1,
    TypeInteger = 2,
    TypeDecimal = 3,
    TypePercent = 4,
    TypeBoolean = 5,
    TypeDateTime = 6,
    TypeDate = 7,
    TypeDayDuration = 8,
    TypeMonetary = 9,
    TypeDuration = 10
}
```

#### EpochFolioDashboardWidget
```cpp
enum EpochFolioDashboardWidget {
    WidgetUnspecified = 0,
    WidgetCard = 1,
    WidgetLines = 2,
    WidgetBar = 3,
    WidgetDataTable = 4,
    WidgetXRange = 5,
    WidgetHistogram = 6,
    WidgetPie = 7,
    WidgetHeatMap = 8,
    WidgetBoxPlot = 9,
    WidgetArea = 10,
    WidgetColumn = 11
}
```

### Type Definitions

Common type aliases used throughout the library:

```cpp
namespace epoch_tearsheet {
    using DataFrame = epoch_frame::DataFrame;
    using Series = epoch_frame::Series;
    using Scalar = epoch_frame::Scalar;

    // Size specifications for pie charts
    class PieSize {
    public:
        static PieSize percentage(int percent);
        static PieSize pixels(int pixels);
        std::string toString() const;
    };

    class PieInnerSize {
    public:
        static PieInnerSize percentage(int percent);
        static PieInnerSize pixels(int pixels);
        std::string toString() const;
    };
}
```

### Error Handling

The library uses exceptions for error handling:

```cpp
try {
    auto chart = BarChartBuilder()
        .setTitle("Sales Chart")
        .fromDataFrame(df, "invalid_column")  // May throw
        .build();
} catch (const std::runtime_error& e) {
    std::cerr << "Error building chart: " << e.what() << std::endl;
    // Handle error appropriately
}

// Safe scalar conversion with error checking
epoch_frame::Scalar scalar = getSomeScalar();
try {
    auto value = scalar.cast(arrow::float64()).as_double();
    auto protoScalar = ScalarFactory::fromDecimal(value);
} catch (const arrow::Status& status) {
    std::cerr << "Scalar conversion failed: " << status.ToString() << std::endl;
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Linking Errors
```bash
undefined reference to `epoch_tearsheet::BarChartBuilder::BarChartBuilder()'
```
**Solution**: Ensure the library is properly linked:
```cmake
target_link_libraries(your_app
    epoch::dashboard
    protobuf::libprotobuf
    arrow::arrow_shared
)
```

#### 2. Protocol Buffer Version Mismatch
```
[libprotobuf ERROR] This program was compiled against version 3.21.0 of the
Protocol Buffer runtime library, but the installed version is 3.19.0
```
**Solution**: Rebuild with matching protobuf versions:
```bash
vcpkg remove protobuf
vcpkg install protobuf
cmake --build . --clean-first
```

#### 3. Memory Issues
Use AddressSanitizer for debugging:
```bash
cmake .. -DCMAKE_CXX_FLAGS="-fsanitize=address -g"
cmake --build .
ASAN_OPTIONS=detect_leaks=1 ./bin/epoch_dashboard_test
```

#### 4. Missing Dependencies
```
CMake Error: Could not find a package configuration file provided by "Arrow"
```
**Solution**: Install missing dependencies:
```bash
vcpkg install arrow
# Or system-wide
sudo apt-get install libarrow-dev  # Ubuntu/Debian
brew install apache-arrow            # macOS
```

#### 5. Chart Not Rendering
Ensure all required fields are set:
```cpp
// ✅ Complete configuration
auto chart = BarChartBuilder()
    .setTitle("Chart Title")        // Required
    .setCategory("Category")        // Required for dashboard
    .setData(data)                  // Required data
    .build();

// ❌ Missing required fields
auto chart = BarChartBuilder()
    .build();  // May produce invalid chart
```

### Debug Build

Enable debug symbols and verbose output:

```bash
# Debug build with symbols
cmake .. -DCMAKE_BUILD_TYPE=Debug \
         -DCMAKE_CXX_FLAGS="-g3 -O0"

# Verbose build output
cmake --build . --verbose

# Debug with GDB
gdb ./bin/epoch_dashboard_test
(gdb) run
(gdb) bt  # Backtrace on crash
```

### Performance Profiling

Profile your application:

```bash
# Build with profiling
cmake .. -DCMAKE_CXX_FLAGS="-pg"
cmake --build .

# Run and generate profile
./bin/your_app
gprof ./bin/your_app gmon.out > analysis.txt

# Or use perf (Linux)
perf record -g ./bin/your_app
perf report
```

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/yourusername/EpochDashboard.git
cd EpochDashboard/cpp
```

2. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Install Development Tools**
```bash
# Formatting and linting tools
sudo apt-get install clang-format clang-tidy cppcheck

# Documentation tools
sudo apt-get install doxygen graphviz
```

### Code Style

Follow the project's coding standards:

```bash
# Format code
clang-format -i src/**/*.cpp include/**/*.h

# Run linter
clang-tidy src/**/*.cpp -- -Iinclude

# Static analysis
cppcheck --enable=all --suppress=missingIncludeSystem \
         -I include/ src/
```

### Testing Requirements

- Add tests for all new features
- Maintain >90% code coverage
- All tests must pass before PR

```bash
# Run tests before committing
./build/bin/epoch_dashboard_test

# Check coverage
gcov src/tearsheet/builders/*.cpp
```

### Pull Request Process

1. Update documentation
2. Add/update tests
3. Ensure CI passes
4. Request review
5. Address feedback

### Commit Message Format

```
type(scope): description

- Detailed explanation
- List of changes

Fixes #123
```

Types: feat, fix, docs, test, refactor, style, chore

## Examples

### Example 1: Complete Trading Dashboard

```cpp
#include <epoch_dashboard/tearsheet/tearsheet_builder.h>
#include <epoch_dashboard/tearsheet/all_builders.h>

class TradingDashboard {
public:
    epoch_proto::TearSheet buildDashboard(const DataFrame& trades,
                                          const DataFrame& positions,
                                          const DataFrame& performance) {
        return TearSheetBuilder()
            .setTitle("Trading Strategy Analysis")

            // Performance metrics
            .addCard(buildPerformanceCard(performance))

            // Equity curve
            .addChart(
                LinesChartBuilder()
                    .setTitle("Equity Curve")
                    .fromDataFrame(performance, "date", {"equity", "benchmark"})
                    .build()
            )

            // Drawdown chart
            .addChart(
                AreaChartBuilder()
                    .setTitle("Underwater Plot")
                    .fromDataFrame(performance, "date", {"drawdown"})
                    .build()
            )

            // Return distribution
            .addChart(
                HistogramChartBuilder()
                    .setTitle("Return Distribution")
                    .fromDataFrame(performance, "returns", 50)
                    .build()
            )

            // Current positions
            .addTable(
                TableBuilder()
                    .setTitle("Open Positions")
                    .fromDataFrame(positions)
                    .build()
            )

            // Trade history
            .addTable(
                TableBuilder()
                    .setTitle("Recent Trades")
                    .fromDataFrame(trades.tail(20))
                    .build()
            )

            .build();
    }

private:
    epoch_proto::CardDef buildPerformanceCard(const DataFrame& perf) {
        auto stats = calculateStats(perf);

        return CardBuilder()
            .setCategory("Performance")
            .addCardData(
                CardDataBuilder()
                    .setTitle("Total Return")
                    .setValue(ScalarFactory::fromDecimal(stats.totalReturn))
                    .setType(epoch_proto::TypePercent)
                    .build()
            )
            .addCardData(
                CardDataBuilder()
                    .setTitle("Sharpe Ratio")
                    .setValue(ScalarFactory::fromDecimal(stats.sharpe))
                    .setType(epoch_proto::TypeDecimal)
                    .build()
            )
            .addCardData(
                CardDataBuilder()
                    .setTitle("Max Drawdown")
                    .setValue(ScalarFactory::fromDecimal(stats.maxDrawdown))
                    .setType(epoch_proto::TypePercent)
                    .build()
            )
            .addCardData(
                CardDataBuilder()
                    .setTitle("Win Rate")
                    .setValue(ScalarFactory::fromDecimal(stats.winRate))
                    .setType(epoch_proto::TypePercent)
                    .build()
            )
            .setGroupSize(2)
            .build();
    }
};
```

### Example 2: Risk Analysis Dashboard

```cpp
class RiskDashboard {
public:
    epoch_proto::TearSheet buildRiskAnalysis(const DataFrame& returns) {
        return TearSheetBuilder()
            .setTitle("Risk Analysis")

            // Risk metrics
            .addCard(buildRiskMetricsCard(returns))

            // Correlation heatmap
            .addChart(buildCorrelationHeatmap(returns))

            // VaR analysis
            .addChart(buildVaRChart(returns))

            // Rolling volatility
            .addChart(buildVolatilityChart(returns))

            .build();
    }

private:
    epoch_proto::Chart buildCorrelationHeatmap(const DataFrame& returns) {
        auto corr = calculateCorrelationMatrix(returns);

        HeatMapChartBuilder builder;
        builder.setTitle("Asset Correlation Matrix")
               .setXAxisType(epoch_proto::AxisCategory)
               .setYAxisType(epoch_proto::AxisCategory);

        auto assets = returns.columns();
        builder.setXAxisCategories(assets)
               .setYAxisCategories(assets);

        for (size_t i = 0; i < assets.size(); ++i) {
            for (size_t j = 0; j < assets.size(); ++j) {
                builder.addPoint(i, j, corr(i, j));
            }
        }

        return builder.build();
    }

    epoch_proto::Chart buildVaRChart(const DataFrame& returns) {
        auto var95 = calculateVaR(returns, 0.95);
        auto var99 = calculateVaR(returns, 0.99);

        epoch_proto::StraightLineDef var95Line;
        var95Line.set_title("VaR 95%");
        var95Line.set_value(var95);
        var95Line.set_vertical(true);

        epoch_proto::StraightLineDef var99Line;
        var99Line.set_title("VaR 99%");
        var99Line.set_value(var99);
        var99Line.set_vertical(true);

        return HistogramChartBuilder()
            .setTitle("Value at Risk Analysis")
            .fromDataFrame(returns, "daily_returns", 100)
            .addStraightLine(var95Line)
            .addStraightLine(var99Line)
            .build();
    }
};
```

### Example 3: Portfolio Analysis

```cpp
class PortfolioAnalyzer {
public:
    epoch_proto::TearSheet analyzePortfolio(const Portfolio& portfolio) {
        TearSheetBuilder builder;
        builder.setTitle("Portfolio Analysis Report");

        // Asset allocation pie chart
        builder.addChart(buildAllocationChart(portfolio));

        // Sector breakdown
        builder.addChart(buildSectorChart(portfolio));

        // Geographic distribution
        builder.addChart(buildGeographicChart(portfolio));

        // Performance attribution
        builder.addChart(buildAttributionChart(portfolio));

        // Holdings table
        builder.addTable(buildHoldingsTable(portfolio));

        // Risk decomposition
        builder.addChart(buildRiskDecomposition(portfolio));

        return builder.build();
    }

private:
    epoch_proto::Chart buildAllocationChart(const Portfolio& portfolio) {
        std::vector<epoch_proto::PieData> allocations;

        for (const auto& [assetClass, weight] : portfolio.getAllocations()) {
            epoch_proto::PieData data;
            data.set_name(assetClass);
            data.set_y(weight * 100);
            allocations.push_back(data);
        }

        return PieChartBuilder()
            .setTitle("Asset Class Allocation")
            .addSeries(
                "Current",
                allocations,
                PieSize::percentage(80),
                PieInnerSize::percentage(40)
            )
            .build();
    }

    epoch_proto::Chart buildAttributionChart(const Portfolio& portfolio) {
        auto attrib = portfolio.getAttribution();

        epoch_proto::BarData selection;
        selection.set_name("Selection");
        for (auto val : attrib.selection) {
            selection.add_values(val);
        }

        epoch_proto::BarData allocation;
        allocation.set_name("Allocation");
        for (auto val : attrib.allocation) {
            allocation.add_values(val);
        }

        epoch_proto::BarData interaction;
        interaction.set_name("Interaction");
        for (auto val : attrib.interaction) {
            interaction.add_values(val);
        }

        return BarChartBuilder()
            .setTitle("Performance Attribution")
            .setXAxisType(epoch_proto::AxisCategory)
            .setXAxisCategories(attrib.sectors)
            .addBarData(selection)
            .addBarData(allocation)
            .addBarData(interaction)
            .setStacked(true)
            .build();
    }
};
```

## License

MIT License

Copyright (c) 2024 Epoch Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Support

For issues, questions, or contributions:
- **GitHub Issues**: [https://github.com/epochlab/EpochDashboard/issues](https://github.com/epochlab/EpochDashboard/issues)
- **Documentation**: [https://docs.epochlab.com/dashboard](https://docs.epochlab.com/dashboard)
- **Email**: support@epochlab.com
- **Discord**: [Join our community](https://discord.gg/epochlab)

## Acknowledgments

- Apache Arrow team for the DataFrame foundation
- Protocol Buffers team for efficient serialization
- Catch2 team for the testing framework
- vcpkg team for package management
- All contributors and users of the library

---

**Version**: 1.0.0
**Last Updated**: January 2024
**Status**: Production Ready

This library is actively maintained and used in production at Epoch Labs. We welcome feedback and contributions from the community.