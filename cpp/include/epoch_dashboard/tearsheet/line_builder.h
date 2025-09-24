#pragma once

#include <string>
#include <vector>
#include <optional>

#include "epoch_protos/chart_def.pb.h"

namespace epoch_frame {
    class Series;
}

namespace epoch_tearsheet {

struct LineStyle {
    std::optional<epoch_proto::DashStyle> dash_style;
    std::optional<uint32_t> line_width;
};

class LineBuilder {
public:
    LineBuilder& setName(const std::string& name);
    LineBuilder& setDashStyle(epoch_proto::DashStyle style);
    LineBuilder& setLineWidth(uint32_t width);
    LineBuilder& addPoint(int64_t x, double y);
    LineBuilder& addPoints(const std::vector<epoch_proto::Point>& points);
    LineBuilder& fromSeries(const epoch_frame::Series& series);

    epoch_proto::Line build() const;

private:
    epoch_proto::Line line_;
};

} // namespace epoch_tearsheet