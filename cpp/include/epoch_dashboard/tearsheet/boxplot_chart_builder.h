#pragma once

#include <string>

#include "epoch_protos/chart_def.pb.h"

namespace epoch_tearsheet {

class BoxPlotChartBuilder {
public:
    BoxPlotChartBuilder();

    BoxPlotChartBuilder& setTitle(const std::string& title);
    BoxPlotChartBuilder& setCategory(const std::string& category);
    BoxPlotChartBuilder& setXAxisLabel(const std::string& label);
    BoxPlotChartBuilder& setYAxisLabel(const std::string& label);
    BoxPlotChartBuilder& addOutlier(const epoch_proto::BoxPlotOutlier& outlier);
    BoxPlotChartBuilder& addDataPoint(const epoch_proto::BoxPlotDataPoint& point);

    epoch_proto::Chart build() const;

private:
    epoch_proto::BoxPlotDef box_plot_def_;
};

} // namespace epoch_tearsheet