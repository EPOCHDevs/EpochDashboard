#pragma once

#include <string>

#include "epoch_protos/chart_def.pb.h"

namespace epoch_frame {
    class DataFrame;
    class Series;
}

namespace epoch_tearsheet {

class BarChartBuilder {
public:
    BarChartBuilder();

    BarChartBuilder& setTitle(const std::string& title);
    BarChartBuilder& setCategory(const std::string& category);
    BarChartBuilder& setXAxisLabel(const std::string& label);
    BarChartBuilder& setYAxisLabel(const std::string& label);
    BarChartBuilder& setData(const epoch_proto::Array& data);
    BarChartBuilder& addStraightLine(const epoch_proto::StraightLineDef& line);
    BarChartBuilder& setBarWidth(uint32_t width);
    BarChartBuilder& setVertical(bool vertical);
    BarChartBuilder& fromSeries(const epoch_frame::Series& series);
    BarChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df, const std::string& column);

    epoch_proto::Chart build() const;

private:
    epoch_proto::BarDef bar_def_;
};

} // namespace epoch_tearsheet