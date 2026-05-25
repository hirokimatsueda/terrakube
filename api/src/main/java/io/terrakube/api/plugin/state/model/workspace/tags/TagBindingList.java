package io.terrakube.api.plugin.state.model.workspace.tags;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TagBindingList {
    List<TagBindingModel> data;
}
