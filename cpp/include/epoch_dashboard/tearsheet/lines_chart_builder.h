#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"

namespace epoch_frame {
    class DataFrame;
}

namespace epoch_tearsheet {

class LinesChartBuilder {
public:
    LinesChartBuilder();

    LinesChartBuilder& setTitle(const std::string& title);
    LinesChartBuilder& setCategory(const std::string& category);
    LinesChartBuilder& setXAxisLabel(const std::string& label);
    LinesChartBuilder& setYAxisLabel(const std::string& label);
    LinesChartBuilder& addLine(const epoch_proto::Line& line);
    LinesChartBuilder& addLines(const std::vector<epoch_proto::Line>& lines);
    LinesChartBuilder& addStraightLine(const epoch_proto::StraightLineDef& line);
    LinesChartBuilder& addYPlotBand(const epoch_proto::Band& band);
    LinesChartBuilder& addXPlotBand(const epoch_proto::Band& band);
    LinesChartBuilder& setOverlay(const epoch_proto::Line& overlay);
    LinesChartBuilder& setStacked(bool stacked);
    LinesChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df, const std::string& x_col, const std::vector<std::string>& y_cols);

    epoch_proto::Chart build() const;

private:
    epoch_proto::LinesDef lines_def_;
};

} // namespace epoch_tearsheet