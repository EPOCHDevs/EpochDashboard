#include "epoch_dashboard/tearsheet/xrange_chart_builder.h"

namespace epoch_tearsheet {

XRangeChartBuilder::XRangeChartBuilder() {
    x_range_def_.mutable_chart_def()->set_type(epoch_proto::WidgetXRange);
}

XRangeChartBuilder& XRangeChartBuilder::setTitle(const std::string& title) {
    x_range_def_.mutable_chart_def()->set_title(title);
    return *this;
}

XRangeChartBuilder& XRangeChartBuilder::setCategory(const std::string& category) {
    x_range_def_.mutable_chart_def()->set_category(category);
    return *this;
}

XRangeChartBuilder& XRangeChartBuilder::setXAxisLabel(const std::string& label) {
    x_range_def_.mutable_chart_def()->mutable_x_axis()->set_label(label);
    return *this;
}

XRangeChartBuilder& XRangeChartBuilder::setYAxisLabel(const std::string& label) {
    x_range_def_.mutable_chart_def()->mutable_y_axis()->set_label(label);
    return *this;
}

XRangeChartBuilder& XRangeChartBuilder::addCategory(const std::string& category) {
    x_range_def_.add_categories(category);
    return *this;
}

XRangeChartBuilder& XRangeChartBuilder::addPoint(int64_t x, int64_t x2, uint64_t y, bool is_long) {
    auto* point = x_range_def_.add_points();
    point->set_x(x);
    point->set_x2(x2);
    point->set_y(y);
    point->set_is_long(is_long);
    return *this;
}

XRangeChartBuilder& XRangeChartBuilder::addPoint(const epoch_proto::XRangePoint& point) {
    *x_range_def_.add_points() = point;
    return *this;
}

epoch_proto::Chart XRangeChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_x_range_def() = x_range_def_;
    return chart;
}

} // namespace epoch_tearsheet