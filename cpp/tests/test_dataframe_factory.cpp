#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include "epoch_dashboard/tearsheet/table_builder.h"
#include "epoch_dashboard/tearsheet/lines_chart_builder.h"
#include "epoch_dashboard/tearsheet/bar_chart_builder.h"
#include "epoch_dashboard/tearsheet/histogram_chart_builder.h"
#include <epoch_frame/dataframe.h>
#include <arrow/api.h>

using namespace epoch_tearsheet;
using namespace epoch_frame;

TEST_CASE("DataFrameFactory: toColumnDefs for TableBuilder", "[dataframe]") {
    std::vector<double> col_a = {1.0, 2.0, 3.0};
    std::vector<int32_t> col_b = {10, 20, 30};
    std::vector<std::string> col_c = {"a", "b", "c"};

    arrow::DoubleBuilder double_builder;
    arrow::Int32Builder int_builder;
    arrow::StringBuilder string_builder;

    REQUIRE(double_builder.AppendValues(col_a).ok());
    REQUIRE(int_builder.AppendValues(col_b).ok());
    REQUIRE(string_builder.AppendValues(col_c).ok());

    std::shared_ptr<arrow::Array> double_array, int_array, string_array;
    REQUIRE(double_builder.Finish(&double_array).ok());
    REQUIRE(int_builder.Finish(&int_array).ok());
    REQUIRE(string_builder.Finish(&string_array).ok());

    auto schema = arrow::schema({
        arrow::field("price", arrow::float64()),
        arrow::field("quantity", arrow::int32()),
        arrow::field("symbol", arrow::utf8())
    });

    auto table = arrow::Table::Make(schema, {double_array, int_array, string_array});
    DataFrame df(table);

    auto cols = DataFrameFactory::toColumnDefs(df);

    REQUIRE(cols.size() == 3);
    REQUIRE(cols[0].id() == "price");
    REQUIRE(cols[0].name() == "price");
    REQUIRE(cols[0].type() == epoch_proto::TypeDecimal);

    REQUIRE(cols[1].id() == "quantity");
    REQUIRE(cols[1].type() == epoch_proto::TypeInteger);

    REQUIRE(cols[2].id() == "symbol");
    REQUIRE(cols[2].type() == epoch_proto::TypeString);
}

TEST_CASE("DataFrameFactory: toColumnDef with custom display name", "[dataframe]") {
    std::vector<double> data = {1.5, 2.5};

    arrow::DoubleBuilder builder;
    REQUIRE(builder.AppendValues(data).ok());
    std::shared_ptr<arrow::Array> array;
    REQUIRE(builder.Finish(&array).ok());

    auto schema = arrow::schema({arrow::field("returns", arrow::float64())});
    auto table = arrow::Table::Make(schema, {array});
    DataFrame df(table);

    auto col = DataFrameFactory::toColumnDef(df, "returns", "Returns (%)", epoch_proto::TypePercent);

    REQUIRE(col.id() == "returns");
    REQUIRE(col.name() == "Returns (%)");
    REQUIRE(col.type() == epoch_proto::TypePercent);
}

TEST_CASE("DataFrameFactory: toTableRows for TableBuilder", "[dataframe]") {
    std::vector<double> col1 = {1.0, 2.0};
    std::vector<double> col2 = {10.0, 20.0};

    arrow::DoubleBuilder builder1, builder2;
    REQUIRE(builder1.AppendValues(col1).ok());
    REQUIRE(builder2.AppendValues(col2).ok());

    std::shared_ptr<arrow::Array> array1, array2;
    REQUIRE(builder1.Finish(&array1).ok());
    REQUIRE(builder2.Finish(&array2).ok());

    auto schema = arrow::schema({
        arrow::field("A", arrow::float64()),
        arrow::field("B", arrow::float64())
    });

    auto table = arrow::Table::Make(schema, {array1, array2});
    DataFrame df(table);

    auto rows = DataFrameFactory::toTableRows(df);

    REQUIRE(rows.size() == 2);
    REQUIRE(rows[0].values_size() == 2);
    REQUIRE(rows[0].values(0).decimal_value() == 1.0);
    REQUIRE(rows[0].values(1).decimal_value() == 10.0);

    REQUIRE(rows[1].values(0).decimal_value() == 2.0);
    REQUIRE(rows[1].values(1).decimal_value() == 20.0);
}

TEST_CASE("DataFrameFactory: toLines for LinesChartBuilder", "[dataframe]") {
    std::vector<double> x_data = {1.0, 2.0};
    std::vector<double> y1_data = {10.0, 20.0};
    std::vector<double> y2_data = {100.0, 200.0};

    arrow::DoubleBuilder x_builder, y1_builder, y2_builder;
    REQUIRE(x_builder.AppendValues(x_data).ok());
    REQUIRE(y1_builder.AppendValues(y1_data).ok());
    REQUIRE(y2_builder.AppendValues(y2_data).ok());

    std::shared_ptr<arrow::Array> x_array, y1_array, y2_array;
    REQUIRE(x_builder.Finish(&x_array).ok());
    REQUIRE(y1_builder.Finish(&y1_array).ok());
    REQUIRE(y2_builder.Finish(&y2_array).ok());

    auto schema = arrow::schema({
        arrow::field("time", arrow::float64()),
        arrow::field("returns", arrow::float64()),
        arrow::field("benchmark", arrow::float64())
    });

    auto table = arrow::Table::Make(schema, {x_array, y1_array, y2_array});
    DataFrame df(table);

    auto lines = DataFrameFactory::toLines(df, "time", {"returns", "benchmark"});

    REQUIRE(lines.size() == 2);
    REQUIRE(lines[0].name() == "returns");
    REQUIRE(lines[1].name() == "benchmark");
    REQUIRE(lines[0].data_size() == 2);
    REQUIRE(lines[1].data(0).y() == 100.0);
}

TEST_CASE("DataFrameFactory: toArray for BarChartBuilder", "[dataframe]") {
    std::vector<double> data = {1.5, 2.5, 3.5};

    arrow::DoubleBuilder builder;
    REQUIRE(builder.AppendValues(data).ok());
    std::shared_ptr<arrow::Array> array;
    REQUIRE(builder.Finish(&array).ok());

    auto schema = arrow::schema({arrow::field("values", arrow::float64())});
    auto table = arrow::Table::Make(schema, {array});
    DataFrame df(table);

    auto proto_array = DataFrameFactory::toArray(df, "values");

    REQUIRE(proto_array.values_size() == 3);
    REQUIRE(proto_array.values(0).decimal_value() == 1.5);
    REQUIRE(proto_array.values(1).decimal_value() == 2.5);
    REQUIRE(proto_array.values(2).decimal_value() == 3.5);
}

TEST_CASE("TableBuilder: fromDataFrame integration", "[dataframe]") {
    std::vector<double> prices = {100.5, 101.2};
    std::vector<int32_t> volumes = {1000, 2000};

    arrow::DoubleBuilder price_builder;
    arrow::Int32Builder volume_builder;

    REQUIRE(price_builder.AppendValues(prices).ok());
    REQUIRE(volume_builder.AppendValues(volumes).ok());

    std::shared_ptr<arrow::Array> price_array, volume_array;
    REQUIRE(price_builder.Finish(&price_array).ok());
    REQUIRE(volume_builder.Finish(&volume_array).ok());

    auto schema = arrow::schema({
        arrow::field("price", arrow::float64()),
        arrow::field("volume", arrow::int32())
    });

    auto table = arrow::Table::Make(schema, {price_array, volume_array});
    DataFrame df(table);

    auto proto_table = TableBuilder()
        .setTitle("Market Data")
        .fromDataFrame(df)
        .build();

    REQUIRE(proto_table.title() == "Market Data");
    REQUIRE(proto_table.columns_size() == 2);
    REQUIRE(proto_table.data().rows_size() == 2);
    REQUIRE(proto_table.columns(0).name() == "price");
    REQUIRE(proto_table.columns(1).name() == "volume");
}

TEST_CASE("LinesChartBuilder: fromDataFrame integration", "[dataframe]") {
    std::vector<double> x = {1.0, 2.0};
    std::vector<double> y = {10.0, 20.0};

    arrow::DoubleBuilder x_builder, y_builder;
    REQUIRE(x_builder.AppendValues(x).ok());
    REQUIRE(y_builder.AppendValues(y).ok());

    std::shared_ptr<arrow::Array> x_array, y_array;
    REQUIRE(x_builder.Finish(&x_array).ok());
    REQUIRE(y_builder.Finish(&y_array).ok());

    auto schema = arrow::schema({
        arrow::field("date", arrow::float64()),
        arrow::field("price", arrow::float64())
    });

    auto table = arrow::Table::Make(schema, {x_array, y_array});
    DataFrame df(table);

    // This should throw because the default index is not a timestamp array
    REQUIRE_THROWS_AS(
        LinesChartBuilder()
            .setTitle("Price Chart")
            .fromDataFrame(df, {"price"}),
        std::exception
    );
}

TEST_CASE("BarChartBuilder: fromDataFrame integration", "[dataframe]") {
    std::vector<double> data = {5.0, 10.0, 15.0};

    arrow::DoubleBuilder builder;
    REQUIRE(builder.AppendValues(data).ok());
    std::shared_ptr<arrow::Array> array;
    REQUIRE(builder.Finish(&array).ok());

    auto schema = arrow::schema({arrow::field("sales", arrow::float64())});
    auto table = arrow::Table::Make(schema, {array});
    DataFrame df(table);

    auto chart = BarChartBuilder()
        .setTitle("Sales")
        .fromDataFrame(df, "sales")
        .build();

    REQUIRE(chart.has_bar_def());
    REQUIRE(chart.bar_def().chart_def().title() == "Sales");
    // The setData method converts to BarData format, so we check data_size()
    REQUIRE(chart.bar_def().data_size() == 1);
    REQUIRE(chart.bar_def().data(0).values_size() == 3);
}

TEST_CASE("HistogramChartBuilder: fromDataFrame integration", "[dataframe]") {
    std::vector<double> data = {1.0, 2.0, 3.0, 4.0, 5.0};

    arrow::DoubleBuilder builder;
    REQUIRE(builder.AppendValues(data).ok());
    std::shared_ptr<arrow::Array> array;
    REQUIRE(builder.Finish(&array).ok());

    auto schema = arrow::schema({arrow::field("distribution", arrow::float64())});
    auto table = arrow::Table::Make(schema, {array});
    DataFrame df(table);

    auto chart = HistogramChartBuilder()
        .setTitle("Distribution")
        .fromDataFrame(df, "distribution", 10)
        .build();

    REQUIRE(chart.has_histogram_def());
    REQUIRE(chart.histogram_def().chart_def().title() == "Distribution");
    REQUIRE(chart.histogram_def().bins_count() == 10);
    REQUIRE(chart.histogram_def().data().values_size() == 5);
}


TEST_CASE("DataFrameFactory: Null value handling", "[dataframe]") {
    arrow::DoubleBuilder builder;
    REQUIRE(builder.AppendNull().ok());
    REQUIRE(builder.Append(2.5).ok());

    std::shared_ptr<arrow::Array> array;
    REQUIRE(builder.Finish(&array).ok());

    auto schema = arrow::schema({arrow::field("with_nulls", arrow::float64())});
    auto table = arrow::Table::Make(schema, {array});
    DataFrame df(table);

    auto rows = DataFrameFactory::toTableRows(df);

    REQUIRE(rows.size() == 2);
    REQUIRE(rows[0].values(0).has_null_value());
    REQUIRE(rows[1].values(0).decimal_value() == 2.5);
}