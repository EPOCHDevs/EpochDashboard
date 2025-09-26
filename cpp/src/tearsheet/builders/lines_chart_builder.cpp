#include "epoch_dashboard/tearsheet/lines_chart_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"

namespace epoch_tearsheet {

LinesChartBuilder::LinesChartBuilder() {
    lines_def_.mutable_chart_def()->set_type(epoch_proto::WidgetLines);
}

LinesChartBuilder& LinesChartBuilder::addLine(const epoch_proto::Line& line) {
    *lines_def_.add_lines() = line;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::addLines(const std::vector<epoch_proto::Line>& lines) {
    for (const auto& line : lines) {
        *lines_def_.add_lines() = line;
    }
    return *this;
}

LinesChartBuilder& LinesChartBuilder::addStraightLine(const epoch_proto::StraightLineDef& line) {
    *lines_def_.add_straight_lines() = line;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::addYPlotBand(const epoch_proto::Band& band) {
    *lines_def_.add_y_plot_bands() = band;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::addXPlotBand(const epoch_proto::Band& band) {
    *lines_def_.add_x_plot_bands() = band;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::setOverlay(const epoch_proto::Line& overlay) {
    *lines_def_.mutable_overlay() = overlay;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::setStacked(bool stacked) {
    lines_def_.set_stacked(stacked);
    return *this;
}

LinesChartBuilder& LinesChartBuilder::fromDataFrame(const epoch_frame::DataFrame& df,
                                                      const std::string& x_col,
                                                      const std::vector<std::string>& y_cols) {
    auto lines = DataFrameFactory::toLines(df, x_col, y_cols);
    addLines(lines);
    return *this;
}

epoch_proto::Chart LinesChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_lines_def() = lines_def_;
    return chart;
}

} // namespace epoch_tearsheet