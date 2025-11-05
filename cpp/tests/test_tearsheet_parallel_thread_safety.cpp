#include <catch2/catch_test_macros.hpp>
#include <catch2/matchers/catch_matchers_string.hpp>
#include "epoch_dashboard/tearsheet/tearsheet_builder.h"
#include "epoch_dashboard/tearsheet/card_builder.h"
#include "epoch_dashboard/tearsheet/table_builder.h"
#include "epoch_dashboard/tearsheet/bar_chart_builder.h"
#include "epoch_dashboard/tearsheet/lines_chart_builder.h"
#include "epoch_dashboard/tearsheet/line_builder.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"

#include <thread>
#include <vector>
#include <atomic>
#include <algorithm>

using namespace epoch_tearsheet;

TEST_CASE("DashboardBuilder: Thread-safe parallel additions", "[tearsheet][thread-safety][parallel]") {
    
    SECTION("Parallel card additions from multiple threads") {
        DashboardBuilder builder;
        builder.setCategory("Performance");
        
        constexpr int num_threads = 10;
        constexpr int cards_per_thread = 50;
        
        std::vector<std::thread> threads;
        threads.reserve(num_threads);
        
        // Launch threads that concurrently add cards
        for (int t = 0; t < num_threads; ++t) {
            threads.emplace_back([&builder, t]() {
                for (int i = 0; i < cards_per_thread; ++i) {
                    auto card = CardBuilder()
                        .setType(epoch_proto::WidgetCard)
                        .setCategory("Test")
                        .addCardData(
                            CardDataBuilder()
                                .setTitle("Card_" + std::to_string(t) + "_" + std::to_string(i))
                                .setValue(ScalarFactory::fromDecimal(static_cast<double>(t * 100 + i)))
                                .setType(epoch_proto::TypeDecimal)
                                .build()
                        )
                        .build();
                    
                    builder.addCard(card);
                }
            });
        }
        
        // Wait for all threads to complete
        for (auto& thread : threads) {
            thread.join();
        }
        
        // Build and verify
        auto tearsheet = builder.build();
        
        REQUIRE(tearsheet.has_cards());
        REQUIRE(tearsheet.cards().cards_size() == num_threads * cards_per_thread);
    }
    
    SECTION("Parallel chart additions from multiple threads") {
        DashboardBuilder builder;
        builder.setCategory("Charts");
        
        constexpr int num_threads = 8;
        constexpr int charts_per_thread = 25;
        
        std::vector<std::thread> threads;
        threads.reserve(num_threads);
        
        // Launch threads that concurrently add charts
        for (int t = 0; t < num_threads; ++t) {
            threads.emplace_back([&builder, t]() {
                for (int i = 0; i < charts_per_thread; ++i) {
                    epoch_proto::BarData bar_data;
                    bar_data.set_name("Series_" + std::to_string(t) + "_" + std::to_string(i));
                    bar_data.add_values(10.0 + t);
                    bar_data.add_values(20.0 + i);
                    bar_data.add_values(30.0 + t + i);
                    
                    auto chart = BarChartBuilder()
                        .setTitle("Chart_" + std::to_string(t) + "_" + std::to_string(i))
                        .addBarData(bar_data)
                        .setVertical(true)
                        .build();
                    
                    builder.addChart(chart);
                }
            });
        }
        
        // Wait for all threads to complete
        for (auto& thread : threads) {
            thread.join();
        }
        
        // Build and verify
        auto tearsheet = builder.build();
        
        REQUIRE(tearsheet.has_charts());
        REQUIRE(tearsheet.charts().charts_size() == num_threads * charts_per_thread);
    }
    
    SECTION("Parallel table additions from multiple threads") {
        DashboardBuilder builder;
        builder.setCategory("Tables");
        
        constexpr int num_threads = 6;
        constexpr int tables_per_thread = 30;
        
        std::vector<std::thread> threads;
        threads.reserve(num_threads);
        
        // Launch threads that concurrently add tables
        for (int t = 0; t < num_threads; ++t) {
            threads.emplace_back([&builder, t]() {
                for (int i = 0; i < tables_per_thread; ++i) {
                    auto table = TableBuilder()
                        .setType(epoch_proto::WidgetDataTable)
                        .setTitle("Table_" + std::to_string(t) + "_" + std::to_string(i))
                        .addColumn("col1", "Column 1", epoch_proto::TypeDecimal)
                        .addColumn("col2", "Column 2", epoch_proto::TypeInteger)
                        .build();
                    
                    builder.addTable(table);
                }
            });
        }
        
        // Wait for all threads to complete
        for (auto& thread : threads) {
            thread.join();
        }
        
        // Build and verify
        auto tearsheet = builder.build();
        
        REQUIRE(tearsheet.has_tables());
        REQUIRE(tearsheet.tables().tables_size() == num_threads * tables_per_thread);
    }
    
    SECTION("Parallel mixed additions: cards, charts, and tables in one dashboard") {
        DashboardBuilder builder;
        builder.setCategory("Mixed");
        
        constexpr int num_threads = 12;
        constexpr int items_per_type_per_thread = 20;
        
        std::vector<std::thread> threads;
        threads.reserve(num_threads);
        
        // Launch threads that concurrently add all three types
        for (int t = 0; t < num_threads; ++t) {
            threads.emplace_back([&builder, t]() {
                // Add cards
                for (int i = 0; i < items_per_type_per_thread; ++i) {
                    auto card = CardBuilder()
                        .setType(epoch_proto::WidgetCard)
                        .setCategory("Mixed")
                        .addCardData(
                            CardDataBuilder()
                                .setTitle("Card_T" + std::to_string(t) + "_I" + std::to_string(i))
                                .setValue(ScalarFactory::fromInteger(t * 1000 + i))
                                .setType(epoch_proto::TypeInteger)
                                .build()
                        )
                        .build();
                    builder.addCard(card);
                }
                
                // Add charts
                for (int i = 0; i < items_per_type_per_thread; ++i) {
                    epoch_proto::Line line;
                    line.set_name("Line_T" + std::to_string(t) + "_I" + std::to_string(i));
                    
                    for (int p = 0; p < 5; ++p) {
                        auto* point = line.add_data();
                        point->set_x(p * 1000);
                        point->set_y(static_cast<double>(t + i + p));
                    }
                    
                    auto chart = LinesChartBuilder()
                        .setTitle("Chart_T" + std::to_string(t) + "_I" + std::to_string(i))
                        .addLine(line)
                        .build();
                    
                    builder.addChart(chart);
                }
                
                // Add tables
                for (int i = 0; i < items_per_type_per_thread; ++i) {
                    epoch_proto::TableRow row;
                    *row.add_values() = ScalarFactory::fromDecimal(static_cast<double>(t + i));
                    *row.add_values() = ScalarFactory::fromInteger(t * 100 + i);
                    
                    auto table = TableBuilder()
                        .setType(epoch_proto::WidgetDataTable)
                        .setTitle("Table_T" + std::to_string(t) + "_I" + std::to_string(i))
                        .addColumn("value", "Value", epoch_proto::TypeDecimal)
                        .addColumn("count", "Count", epoch_proto::TypeInteger)
                        .addRow(row)
                        .build();
                    
                    builder.addTable(table);
                }
            });
        }
        
        // Wait for all threads to complete
        for (auto& thread : threads) {
            thread.join();
        }
        
        // Build and verify all items are present
        auto tearsheet = builder.build();
        
        int expected_count = num_threads * items_per_type_per_thread;
        
        REQUIRE(tearsheet.has_cards());
        REQUIRE(tearsheet.cards().cards_size() == expected_count);
        
        REQUIRE(tearsheet.has_charts());
        REQUIRE(tearsheet.charts().charts_size() == expected_count);
        
        REQUIRE(tearsheet.has_tables());
        REQUIRE(tearsheet.tables().tables_size() == expected_count);
    }
    
    SECTION("Repeated builds are idempotent and cumulative") {
        DashboardBuilder builder;
        builder.setCategory("Repeated");
        
        constexpr int num_writer_threads = 8;
        constexpr int items_per_writer = 25;
        
        std::vector<std::thread> threads;
        
        // Launch writer threads
        for (int t = 0; t < num_writer_threads; ++t) {
            threads.emplace_back([&builder, t]() {
                for (int i = 0; i < items_per_writer; ++i) {
                    // Add a card
                    auto card = CardBuilder()
                        .setType(epoch_proto::WidgetCard)
                        .addCardData(
                            CardDataBuilder()
                                .setTitle("Card_" + std::to_string(t * items_per_writer + i))
                                .setValue(ScalarFactory::fromDecimal(1.0 + i))
                                .build()
                        )
                        .build();
                    builder.addCard(card);
                    
                    // Add a chart
                    epoch_proto::BarData bar_data;
                    bar_data.set_name("Bar_" + std::to_string(t * items_per_writer + i));
                    bar_data.add_values(static_cast<double>(i + 1));
                    
                    auto chart = BarChartBuilder()
                        .setTitle("Chart_" + std::to_string(t * items_per_writer + i))
                        .addBarData(bar_data)
                        .build();
                    builder.addChart(chart);
                    
                    // Add a table
                    auto table = TableBuilder()
                        .setTitle("Table_" + std::to_string(t * items_per_writer + i))
                        .addColumn("id", "ID", epoch_proto::TypeInteger)
                        .build();
                    builder.addTable(table);
                }
            });
        }
        
        // Wait for all writers to complete
        for (auto& thread : threads) {
            thread.join();
        }
        
        // Build should be idempotent - calling multiple times gives same result
        auto first_build = builder.build();
        auto second_build = builder.build();
        auto third_build = builder.build();
        
        int expected_count = num_writer_threads * items_per_writer;
        
        // All builds should have the same counts
        REQUIRE(first_build.cards().cards_size() == expected_count);
        REQUIRE(first_build.charts().charts_size() == expected_count);
        REQUIRE(first_build.tables().tables_size() == expected_count);
        
        REQUIRE(second_build.cards().cards_size() == expected_count);
        REQUIRE(second_build.charts().charts_size() == expected_count);
        REQUIRE(second_build.tables().tables_size() == expected_count);
        
        REQUIRE(third_build.cards().cards_size() == expected_count);
        REQUIRE(third_build.charts().charts_size() == expected_count);
        REQUIRE(third_build.tables().tables_size() == expected_count);
    }
    
    SECTION("High contention scenario - many threads adding few items") {
        DashboardBuilder builder;
        builder.setCategory("HighContention");
        
        constexpr int num_threads = 100;
        constexpr int items_per_thread = 5;
        
        std::vector<std::thread> threads;
        threads.reserve(num_threads);
        
        // Launch many threads, each adding a small number of items
        for (int t = 0; t < num_threads; ++t) {
            threads.emplace_back([&builder, t]() {
                for (int i = 0; i < items_per_thread; ++i) {
                    // Interleave different types
                    if (i % 3 == 0) {
                        auto card = CardBuilder()
                            .setType(epoch_proto::WidgetCard)
                            .addCardData(
                                CardDataBuilder()
                                    .setTitle("C_" + std::to_string(t) + "_" + std::to_string(i))
                                    .setValue(ScalarFactory::fromDecimal(1.0))
                                    .build()
                            )
                            .build();
                        builder.addCard(card);
                    } else if (i % 3 == 1) {
                        epoch_proto::BarData bar_data;
                        bar_data.set_name("B_" + std::to_string(t) + "_" + std::to_string(i));
                        bar_data.add_values(1.0);
                        
                        auto chart = BarChartBuilder()
                            .addBarData(bar_data)
                            .build();
                        builder.addChart(chart);
                    } else {
                        auto table = TableBuilder()
                            .setTitle("T_" + std::to_string(t) + "_" + std::to_string(i))
                            .addColumn("x", "X", epoch_proto::TypeInteger)
                            .build();
                        builder.addTable(table);
                    }
                }
            });
        }
        
        // Wait for all threads
        for (auto& thread : threads) {
            thread.join();
        }
        
        // Verify total count
        auto tearsheet = builder.build();
        
        int total_items = 0;
        if (tearsheet.has_cards()) {
            total_items += tearsheet.cards().cards_size();
        }
        if (tearsheet.has_charts()) {
            total_items += tearsheet.charts().charts_size();
        }
        if (tearsheet.has_tables()) {
            total_items += tearsheet.tables().tables_size();
        }
        
        REQUIRE(total_items == num_threads * items_per_thread);
    }
    
    SECTION("Stress test - very large parallel additions") {
        DashboardBuilder builder;
        builder.setCategory("Stress");
        
        constexpr int num_threads = 20;
        constexpr int items_per_type_per_thread = 100;
        
        std::vector<std::thread> threads;
        threads.reserve(num_threads);
        
        for (int t = 0; t < num_threads; ++t) {
            threads.emplace_back([&builder, t]() {
                // Add many cards
                for (int i = 0; i < items_per_type_per_thread; ++i) {
                    auto card = CardBuilder()
                        .setType(epoch_proto::WidgetCard)
                        .addCardData(
                            CardDataBuilder()
                                .setTitle("StressCard")
                                .setValue(ScalarFactory::fromInteger(i))
                                .build()
                        )
                        .build();
                    builder.addCard(card);
                }
                
                // Add many charts
                for (int i = 0; i < items_per_type_per_thread; ++i) {
                    epoch_proto::BarData bar_data;
                    bar_data.set_name("StressBar");
                    bar_data.add_values(static_cast<double>(i));
                    
                    auto chart = BarChartBuilder()
                        .addBarData(bar_data)
                        .build();
                    builder.addChart(chart);
                }
                
                // Add many tables
                for (int i = 0; i < items_per_type_per_thread; ++i) {
                    auto table = TableBuilder()
                        .setTitle("StressTable")
                        .addColumn("data", "Data", epoch_proto::TypeDecimal)
                        .build();
                    builder.addTable(table);
                }
            });
        }
        
        for (auto& thread : threads) {
            thread.join();
        }
        
        auto tearsheet = builder.build();
        
        int expected_per_type = num_threads * items_per_type_per_thread;
        REQUIRE(tearsheet.cards().cards_size() == expected_per_type);
        REQUIRE(tearsheet.charts().charts_size() == expected_per_type);
        REQUIRE(tearsheet.tables().tables_size() == expected_per_type);
    }
}

