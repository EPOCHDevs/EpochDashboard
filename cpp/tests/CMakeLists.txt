# Find required packages
find_package(trompeloeil REQUIRED)

# Create a test executable with all tests
add_executable(epoch_dashboard_test
    test_scalar_converter.cpp
    test_series_converter.cpp
    test_dataframe_factory.cpp
    test_table_builder.cpp
    test_area_chart_builder.cpp
    test_chart_builder_base.cpp
    test_lines_chart_builder.cpp
    test_bar_chart_builder.cpp
    test_histogram_chart_builder.cpp
    test_heatmap_chart_builder.cpp
    test_boxplot_chart_builder.cpp
    test_xrange_chart_builder.cpp
    test_pie_chart_builder.cpp
    test_card_builder.cpp
    test_line_builder.cpp
    test_numeric_line_builder.cpp
    test_chart_validation.cpp
)

# Link libraries
target_link_libraries(epoch_dashboard_test
    PRIVATE
        epoch::dashboard
        Catch2::Catch2WithMain
        trompeloeil::trompeloeil
)

# Compile options
target_compile_options(epoch_dashboard_test PRIVATE
    -Wall
    -Wextra
    -Wpedantic
)