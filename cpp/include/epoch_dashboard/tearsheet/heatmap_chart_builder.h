#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"

namespace epoch_tearsheet {

class HeatMapChartBuilder {
public:
    HeatMapChartBuilder();

    HeatMapChartBuilder& setTitle(const std::string& title);
    HeatMapChartBuilder& setCategory(const std::string& category);
    HeatMapChartBuilder& setXAxisLabel(const std::string& label);
    HeatMapChartBuilder& setYAxisLabel(const std::string& label);
    HeatMapChartBuilder& addPoint(uint64_t x, uint64_t y, double value);
    HeatMapChartBuilder& addPoints(const std::vector<epoch_proto::HeatMapPoint>& points);

    epoch_proto::Chart build() const;

private:
    epoch_proto::HeatMapDef heat_map_def_;
};

} // namespace epoch_tearsheet