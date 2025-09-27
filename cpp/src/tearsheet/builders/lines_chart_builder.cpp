#include "epoch_dashboard/tearsheet/lines_chart_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include "epoch_protos/common.pb.h"
#include <arrow/api.h>
#include <epoch_frame/dataframe.h>
#include <epoch_frame/index.h>

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
                                                      const std::vector<std::string>& y_cols) {
    std::vector<epoch_proto::Line> lines;
    lines.reserve(y_cols.size());

    auto arrow_table = df.table();
    auto timestamp_array = df.index()->array().to_timestamp_view();

    // Get the timestamp type to determine the time unit
    auto timestamp_type = std::static_pointer_cast<arrow::TimestampType>(timestamp_array->type());
    auto time_unit = timestamp_type->unit();

    for (const auto& y_col : y_cols) {
        epoch_proto::Line line;
        line.set_name(y_col);

        auto y_column = arrow_table->GetColumnByName(y_col);
        if (!y_column) {
            continue;
        }

        for (int64_t i = 0; i < std::min(timestamp_array->length(), y_column->length()); ++i) {
            auto y_result = y_column->GetScalar(i);

            if (y_result.ok()) {
                auto y_scalar = y_result.ValueOrDie();

                if (y_scalar->is_valid && !timestamp_array->IsNull(i)) {
                    auto* point = line.add_data();
                    // Convert timestamp to milliseconds using the proper time unit
                    int64_t timestamp_value = timestamp_array->Value(i);
                    point->set_x(DataFrameFactory::toMilliseconds(timestamp_value, time_unit));
                    point->set_y(std::static_pointer_cast<arrow::DoubleScalar>(y_scalar)->value);
                }
            }
        }

        lines.push_back(line);
    }

    addLines(lines);

    // Set appropriate axis definitions for timestamp-based data
    setXAxisType(epoch_proto::AxisDateTime);
    setYAxisType(epoch_proto::AxisLinear);

    return *this;
}

epoch_proto::Chart LinesChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_lines_def() = lines_def_;
    return chart;
}

} // namespace epoch_tearsheet