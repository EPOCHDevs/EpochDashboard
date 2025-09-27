#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"
#include "epoch_dashboard/tearsheet/chart_builder_base.h"

namespace epoch_frame {
    class DataFrame;
}

namespace epoch_tearsheet {

class LinesChartBuilder : public ChartBuilderBase<LinesChartBuilder> {
public:
    LinesChartBuilder();

    // Required for CRTP base class
    epoch_proto::ChartDef* getChartDefImpl() { return lines_def_.mutable_chart_def(); }

    // Chart-specific methods
    LinesChartBuilder& addLine(const epoch_proto::Line& line);
    LinesChartBuilder& addLines(const std::vector<epoch_proto::Line>& lines);
    LinesChartBuilder& addStraightLine(const epoch_proto::StraightLineDef& line);
    LinesChartBuilder& addYPlotBand(const epoch_proto::Band& band);
    LinesChartBuilder& addXPlotBand(const epoch_proto::Band& band);
    LinesChartBuilder& setOverlay(const epoch_proto::Line& overlay);
    LinesChartBuilder& setStacked(bool stacked);
    LinesChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df, const std::vector<std::string>& y_cols);

    epoch_proto::Chart build() const;

private:
    epoch_proto::LinesDef lines_def_;
};

} // namespace epoch_tearsheet