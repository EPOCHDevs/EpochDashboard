#include "epoch_dashboard/tearsheet/line_builder.h"
#include "epoch_dashboard/tearsheet/series_converter.h"

namespace epoch_tearsheet {

LineBuilder& LineBuilder::setName(const std::string& name) {
    line_.set_name(name);
    return *this;
}

LineBuilder& LineBuilder::setDashStyle(epoch_proto::DashStyle style) {
    line_.set_dash_style(style);
    return *this;
}

LineBuilder& LineBuilder::setLineWidth(uint32_t width) {
    line_.set_line_width(width);
    return *this;
}

LineBuilder& LineBuilder::addPoint(int64_t x, double y) {
    auto* point = line_.add_data();
    point->set_x(x);
    point->set_y(y);
    return *this;
}

LineBuilder& LineBuilder::addPoints(const std::vector<epoch_proto::Point>& points) {
    for (const auto& point : points) {
        *line_.add_data() = point;
    }
    return *this;
}

LineBuilder& LineBuilder::fromSeries(const epoch_frame::Series& series) {
    auto points = SeriesFactory::toPoints(series, series);
    addPoints(points);
    return *this;
}

epoch_proto::Line LineBuilder::build() const {
    return line_;
}

} // namespace epoch_tearsheet