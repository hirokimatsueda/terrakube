package io.terrakube.api.plugin.state.model.workspace.tags;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.terrakube.api.plugin.state.model.generic.Resource;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
public class TagBindingModel extends Resource {
    Map<String, Object> attributes;
}
