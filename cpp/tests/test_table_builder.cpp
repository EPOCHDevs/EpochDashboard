#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/table_builder.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include <epoch_frame/dataframe.h>
#include <arrow/api.h>

using namespace epoch_tearsheet;
using namespace epoch_frame;

TEST_CASE("TableBuilder: Basic table construction", "[table]") {
    auto table = TableBuilder()
        .setType(epoch_proto::WidgetDataTable)
        .setCategory("Performance")
        .setTitle("Returns Table")
        .addColumn("returns", "Returns (%)", epoch_proto::TypePercent)
        .addColumn("benchmark", "Benchmark (%)", epoch_proto::TypePercent)
        .build();

    REQUIRE(table.type() == epoch_proto::WidgetDataTable);
    REQUIRE(table.category() == "Performance");
    REQUIRE(table.title() == "Returns Table");
    REQUIRE(table.columns_size() == 2);
    REQUIRE(table.columns(0).id() == "returns");
    REQUIRE(table.columns(0).name() == "Returns (%)");
    REQUIRE(table.columns(0).type() == epoch_proto::TypePercent);
}

TEST_CASE("TableBuilder: Add rows", "[table]") {
    epoch_proto::TableRow row1;
    *row1.add_values() = ScalarFactory::fromDecimal(0.05);
    *row1.add_values() = ScalarFactory::fromDecimal(0.03);

    epoch_proto::TableRow row2;
    *row2.add_values() = ScalarFactory::fromDecimal(0.02);
    *row2.add_values() = ScalarFactory::fromDecimal(0.01);

    auto table = TableBuilder()
        .setTitle("Data")
        .addColumn("col1", "Column 1", epoch_proto::TypeDecimal)
        .addColumn("col2", "Column 2", epoch_proto::TypeDecimal)
        .addRow(row1)
        .addRow(row2)
        .build();

    REQUIRE(table.data().rows_size() == 2);
    REQUIRE(table.data().rows(0).values(0).decimal_value() == 0.05);
    REQUIRE(table.data().rows(1).values(1).decimal_value() == 0.01);
}

TEST_CASE("TableBuilder: fromDataFrame all columns", "[table]") {
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
        .setType(epoch_proto::WidgetDataTable)
        .setTitle("Market Data")
        .fromDataFrame(df)
        .build();

    REQUIRE(proto_table.title() == "Market Data");
    REQUIRE(proto_table.columns_size() == 2);
    REQUIRE(proto_table.data().rows_size() == 2);
    REQUIRE(proto_table.columns(0).name() == "price");
    REQUIRE(proto_table.columns(1).name() == "volume");
    REQUIRE(proto_table.data().rows(0).values(0).decimal_value() == 100.5);
}

TEST_CASE("TableBuilder: fromDataFrame select columns", "[table]") {
    std::vector<double> col_a = {1.0, 2.0};
    std::vector<double> col_b = {10.0, 20.0};
    std::vector<double> col_c = {100.0, 200.0};

    arrow::DoubleBuilder builder_a, builder_b, builder_c;
    REQUIRE(builder_a.AppendValues(col_a).ok());
    REQUIRE(builder_b.AppendValues(col_b).ok());
    REQUIRE(builder_c.AppendValues(col_c).ok());

    std::shared_ptr<arrow::Array> array_a, array_b, array_c;
    REQUIRE(builder_a.Finish(&array_a).ok());
    REQUIRE(builder_b.Finish(&array_b).ok());
    REQUIRE(builder_c.Finish(&array_c).ok());

    auto schema = arrow::schema({
        arrow::field("A", arrow::float64()),
        arrow::field("B", arrow::float64()),
        arrow::field("C", arrow::float64())
    });

    auto table = arrow::Table::Make(schema, {array_a, array_b, array_c});
    DataFrame df(table);

    auto proto_table = TableBuilder()
        .setTitle("Selected Columns")
        .fromDataFrame(df, {"A", "C"})
        .build();

    REQUIRE(proto_table.columns_size() == 2);
    REQUIRE(proto_table.columns(0).name() == "A");
    REQUIRE(proto_table.columns(1).name() == "C");
    REQUIRE(proto_table.data().rows(0).values(1).decimal_value() == 100.0);
}

TEST_CASE("TableBuilder: Mixed column types", "[table]") {
    auto table = TableBuilder()
        .setTitle("Mixed Types")
        .addColumn("symbol", "Symbol", epoch_proto::TypeString)
        .addColumn("price", "Price ($)", epoch_proto::TypeMonetary)
        .addColumn("change", "Change (%)", epoch_proto::TypePercent)
        .addColumn("volume", "Volume", epoch_proto::TypeInteger)
        .build();

    REQUIRE(table.columns_size() == 4);
    REQUIRE(table.columns(0).type() == epoch_proto::TypeString);
    REQUIRE(table.columns(1).type() == epoch_proto::TypeMonetary);
    REQUIRE(table.columns(2).type() == epoch_proto::TypePercent);
    REQUIRE(table.columns(3).type() == epoch_proto::TypeInteger);
}