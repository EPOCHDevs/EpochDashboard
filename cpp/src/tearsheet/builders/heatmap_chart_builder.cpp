#include "epoch_dashboard/tearsheet/heatmap_chart_builder.h"

namespace epoch_tearsheet {

HeatMapChartBuilder::HeatMapChartBuilder() {
    heat_map_def_.mutable_chart_def()->set_type(epoch_proto::WidgetHeatMap);
}

HeatMapChartBuilder& HeatMapChartBuilder::setTitle(const std::string& title) {
    heat_map_def_.mutable_chart_def()->set_title(title);
    return *this;
}

HeatMapChartBuilder& HeatMapChartBuilder::setCategory(const std::string& category) {
    heat_map_def_.mutable_chart_def()->set_category(category);
    return *this;
}

HeatMapChartBuilder& HeatMapChartBuilder::setXAxisLabel(const std::string& label) {
    heat_map_def_.mutable_chart_def()->mutable_x_axis()->set_label(label);
    return *this;
}

HeatMapChartBuilder& HeatMapChartBuilder::setYAxisLabel(const std::string& label) {
    heat_map_def_.mutable_chart_def()->mutable_y_axis()->set_label(label);
    return *this;
}

HeatMapChartBuilder& HeatMapChartBuilder::addPoint(uint64_t x, uint64_t y, double value) {
    auto* point = heat_map_def_.add_points();
    point->set_x(x);
    point->set_y(y);
    point->set_value(value);
    return *this;
}

HeatMapChartBuilder& HeatMapChartBuilder::addPoints(const std::vector<epoch_proto::HeatMapPoint>& points) {
    for (const auto& point : points) {
        *heat_map_def_.add_points() = point;
    }
    return *this;
}

epoch_proto::Chart HeatMapChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_heat_map_def() = heat_map_def_;
    return chart;
}

} // namespace epoch_tearsheet