#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"
#include "epoch_dashboard/tearsheet/chart_builder_base.h"

namespace epoch_tearsheet {

class BoxPlotChartBuilder : public ChartBuilderBase<BoxPlotChartBuilder> {
public:
    BoxPlotChartBuilder();

    // Required for CRTP base class
    epoch_proto::ChartDef* getChartDefImpl() { return box_plot_def_.mutable_chart_def(); }

    // Chart-specific methods
    BoxPlotChartBuilder& addOutlier(const epoch_proto::BoxPlotOutlier& outlier);
    BoxPlotChartBuilder& addDataPoint(const epoch_proto::BoxPlotDataPoint& point);

    epoch_proto::Chart build() const;

private:
    epoch_proto::BoxPlotDef box_plot_def_;
};

} // namespace epoch_tearsheet