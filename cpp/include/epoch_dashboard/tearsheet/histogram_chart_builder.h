#pragma once

#include <string>

#include "epoch_protos/chart_def.pb.h"

namespace epoch_frame {
    class DataFrame;
    class Series;
}

namespace epoch_tearsheet {

class HistogramChartBuilder {
public:
    HistogramChartBuilder();

    HistogramChartBuilder& setTitle(const std::string& title);
    HistogramChartBuilder& setCategory(const std::string& category);
    HistogramChartBuilder& setXAxisLabel(const std::string& label);
    HistogramChartBuilder& setYAxisLabel(const std::string& label);
    HistogramChartBuilder& setData(const epoch_proto::Array& data);
    HistogramChartBuilder& addStraightLine(const epoch_proto::StraightLineDef& line);
    HistogramChartBuilder& setBinsCount(uint32_t bins);
    HistogramChartBuilder& fromSeries(const epoch_frame::Series& series, uint32_t bins = 30);
    HistogramChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df, const std::string& column, uint32_t bins = 30);

    epoch_proto::Chart build() const;

private:
    epoch_proto::HistogramDef histogram_def_;
};

} // namespace epoch_tearsheet