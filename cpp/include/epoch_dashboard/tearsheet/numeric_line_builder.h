#pragma once

#include <string>
#include <vector>
#include <optional>
#include <type_traits>

#include "epoch_protos/chart_def.pb.h"

namespace epoch_frame {
    class Series;
}

namespace epoch_tearsheet {

class NumericLineBuilder {
public:
    NumericLineBuilder& setName(const std::string& name);
    NumericLineBuilder& setDashStyle(epoch_proto::DashStyle style);
    NumericLineBuilder& setLineWidth(uint32_t width);

    // Add point with floating point x value (required for NumericLine)
    template<typename T>
    NumericLineBuilder& addPoint(T x, double y) {
        static_assert(std::is_floating_point_v<T>,
                      "X axis must be a floating point type for NumericLine");
        auto* point = line_.add_data();
        point->set_x(static_cast<double>(x));
        point->set_y(y);
        return *this;
    }

    NumericLineBuilder& addPoints(const std::vector<epoch_proto::NumericPoint>& points);
    NumericLineBuilder& fromSeries(const epoch_frame::Series& series);

    epoch_proto::NumericLine build() const;

private:
    epoch_proto::NumericLine line_;
};

} // namespace epoch_tearsheet