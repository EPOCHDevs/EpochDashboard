# Define the tearsheet builder library
target_sources(epoch_dashboard PRIVATE
        tearsheet_builder.cpp
        scalar_converter.cpp
        series_converter.cpp
        dataframe_converter.cpp
        column_builder.cpp
        card_builder.cpp
        table_builder.cpp
        line_builder.cpp
        area_chart_builder.cpp
        lines_chart_builder.cpp
        heatmap_chart_builder.cpp
        bar_chart_builder.cpp
        histogram_chart_builder.cpp
        boxplot_chart_builder.cpp
        xrange_chart_builder.cpp
        pie_chart_builder.cpp
)