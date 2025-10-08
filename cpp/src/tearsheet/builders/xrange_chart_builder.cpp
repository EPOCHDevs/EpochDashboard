#include "epoch_dashboard/tearsheet/xrange_chart_builder.h"
#include "epoch_dashboard/tearsheet/validation_utils.h"
#include <sstream>

namespace epoch_tearsheet {

XRangeChartBuilder::XRangeChartBuilder() {
    x_range_def_.mutable_chart_def()->set_type(epoch_proto::WidgetXRange);
}

XRangeChartBuilder& XRangeChartBuilder::addYCategory(const std::string& category) {
    x_range_def_.mutable_chart_def()->mutable_y_axis()->add_categories(category);
    return *this;
}

XRangeChartBuilder& XRangeChartBuilder::addPoint(int64_t x, int64_t x2, uint64_t y, bool is_long) {
    // Validate that x < x2
    if (x >= x2) {
        std::stringstream ss;
        ss << "Invalid XRange point: x (" << x << ") must be less than x2 (" << x2 << ")";
        throw std::runtime_error(ss.str());
    }

    auto* point = x_range_def_.add_points();
    point->set_x(x);
    point->set_x2(x2);
    point->set_y(y);
    point->set_is_long(is_long);
    return *this;
}

XRangeChartBuilder& XRangeChartBuilder::addPoint(const epoch_proto::XRangePoint& point) {
    // Validate the point
    if (point.x() >= point.x2()) {
        std::stringstream ss;
        ss << "Invalid XRange point: x (" << point.x() << ") must be less than x2 (" << point.x2() << ")";
        throw std::runtime_error(ss.str());
    }

    *x_range_def_.add_points() = point;
    return *this;
}

epoch_proto::Chart XRangeChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_x_range_def() = x_range_def_;
    return chart;
}

} // namespace epoch_tearsheet