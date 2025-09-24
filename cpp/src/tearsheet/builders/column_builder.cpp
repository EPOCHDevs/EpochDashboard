#include "epoch_dashboard/tearsheet/column_builder.h"

namespace epoch_tearsheet {

ColumnDefBuilder& ColumnDefBuilder::setId(const std::string& id) {
    column_.set_id(id);
    return *this;
}

ColumnDefBuilder& ColumnDefBuilder::setName(const std::string& name) {
    column_.set_name(name);
    return *this;
}

ColumnDefBuilder& ColumnDefBuilder::setType(epoch_proto::EpochFolioType type) {
    column_.set_type(type);
    return *this;
}

epoch_proto::ColumnDef ColumnDefBuilder::build() const {
    return column_;
}

} // namespace epoch_tearsheet