#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"
#include "epoch_dashboard/tearsheet/chart_builder_base.h"

namespace epoch_tearsheet {

class HeatMapChartBuilder : public ChartBuilderBase<HeatMapChartBuilder> {
public:
    HeatMapChartBuilder();

    // Required for CRTP base class
    epoch_proto::ChartDef* getChartDefImpl() { return heat_map_def_.mutable_chart_def(); }

    // Chart-specific methods
    HeatMapChartBuilder& addPoint(uint64_t x, uint64_t y, double value);
    HeatMapChartBuilder& addPoints(const std::vector<epoch_proto::HeatMapPoint>& points);

    epoch_proto::Chart build() const;

private:
    epoch_proto::HeatMapDef heat_map_def_;
};

} // namespace epoch_tearsheet