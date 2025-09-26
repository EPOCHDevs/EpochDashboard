#include "epoch_dashboard/tearsheet/area_chart_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include "epoch_dashboard/tearsheet/line_builder.h"

namespace epoch_tearsheet {

AreaChartBuilder::AreaChartBuilder() {
    area_def_.mutable_chart_def()->set_type(epoch_proto::WidgetArea);
}

AreaChartBuilder& AreaChartBuilder::addArea(const epoch_proto::Line& area) {
    *area_def_.add_areas() = area;
    return *this;
}

AreaChartBuilder& AreaChartBuilder::addAreas(const std::vector<epoch_proto::Line>& areas) {
    for (const auto& area : areas) {
        *area_def_.add_areas() = area;
    }
    return *this;
}

AreaChartBuilder& AreaChartBuilder::setStacked(bool stacked) {
    area_def_.set_stacked(stacked);
    return *this;
}

AreaChartBuilder& AreaChartBuilder::setStackType(epoch_proto::StackType stack_type) {
    area_def_.set_stack_type(stack_type);
    return *this;
}

AreaChartBuilder& AreaChartBuilder::fromDataFrame(const epoch_frame::DataFrame& df [[maybe_unused]],
                                                    const std::string& x_col [[maybe_unused]],
                                                    const std::vector<std::string>& y_cols) {
    // Convert DataFrame columns to Line messages for area chart
    // This is a simplified implementation - in production, you'd extract data from DataFrame
    for (const auto& y_col : y_cols) {
        LineBuilder line_builder;
        line_builder.setName(y_col);
        // TODO: Extract actual data from DataFrame and add points
        // For now, just create the line with the name
        addArea(line_builder.build());
    }
    return *this;
}

epoch_proto::Chart AreaChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_area_def() = area_def_;
    return chart;
}

} // namespace epoch_tearsheet