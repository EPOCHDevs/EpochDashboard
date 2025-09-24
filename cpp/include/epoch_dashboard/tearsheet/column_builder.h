#pragma once

#include <string>
#include <optional>
#include "epoch_protos/table_def.pb.h"

namespace epoch_tearsheet {

class ColumnDefBuilder {
public:
    ColumnDefBuilder& setId(const std::string& id);
    ColumnDefBuilder& setName(const std::string& name);
    ColumnDefBuilder& setType(epoch_proto::EpochFolioType type);

    epoch_proto::ColumnDef build() const;

private:
    epoch_proto::ColumnDef column_;
};

} // namespace epoch_tearsheet