#pragma once

#include <string>

#include "epoch_protos/chart_def.pb.h"

namespace epoch_tearsheet {

class XRangeChartBuilder {
public:
    XRangeChartBuilder();

    XRangeChartBuilder& setTitle(const std::string& title);
    XRangeChartBuilder& setCategory(const std::string& category);
    XRangeChartBuilder& setXAxisLabel(const std::string& label);
    XRangeChartBuilder& setYAxisLabel(const std::string& label);
    XRangeChartBuilder& addCategory(const std::string& category);
    XRangeChartBuilder& addPoint(int64_t x, int64_t x2, uint64_t y, bool is_long = false);
    XRangeChartBuilder& addPoint(const epoch_proto::XRangePoint& point);

    epoch_proto::Chart build() const;

private:
    epoch_proto::XRangeDef x_range_def_;
};

} // namespace epoch_tearsheet