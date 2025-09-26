#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"
#include "epoch_dashboard/tearsheet/chart_builder_base.h"

namespace epoch_tearsheet {

class XRangeChartBuilder : public ChartBuilderBase<XRangeChartBuilder> {
public:
    XRangeChartBuilder();

    // Required for CRTP base class
    epoch_proto::ChartDef* getChartDefImpl() { return x_range_def_.mutable_chart_def(); }

    // Chart-specific methods
    XRangeChartBuilder& addCategory(const std::string& category);
    XRangeChartBuilder& addPoint(int64_t x, int64_t x2, uint64_t y, bool is_long = false);
    XRangeChartBuilder& addPoint(const epoch_proto::XRangePoint& point);

    epoch_proto::Chart build() const;

private:
    epoch_proto::XRangeDef x_range_def_;
};

} // namespace epoch_tearsheet