/*eslint quotes: [0]*/
let barsImmutable = {
  "id": "bars_immutable",
  "type": "draw.picture",

  "variables": [
    {
      "id": "numberEnergies",
      "name": "number of energies",
      "definition": [{"variable": "energy_in_mwh", "asVector": true}, ".length"]
    },
    {
      "id": "top_mwh",
      "name": "Top MWh",
      "definition": ["40"]
    },
    {
      "id": "bar_color",
      "name": "bar color",
      "definition": ["'#888888'"]
    },
    {
      "id": "max_energy_in_mwh",
      "name": "Max energy in MWh",
      "definition": ["_.max(", {"variable": "energy_in_mwh", "asVector": true}, ")"]
    },
    {
      "id": "barWidth",
      "name": "barWidth",
      "definition": ["1 / ", {"variable": "numberEnergies"}]
    },
    {
      "id": "energy_in_mwh",
      "name": "Energy in MWh",
      "isRow": true,
      "definition": ["[7.2, 29.47, 26.50, 28.2, 0.61, 6.36, 10.32, 16.08, 18.6, 19.08, 18.6]"]
    },
    {
      "id": "norm_energy_in_mwh",
      "name": "Norm energy in MWh",
      "isRow": true,
      "definition": [{"variable": "energy_in_mwh", "asVector": true}, ".map(function(d) { return d / ", {"variable": "top_mwh"}, "});"]
    }
  ],

  "instructions": [
    {
      "id": "rect1",
      "type": "draw.rect",
      "from": {"shape": "canvas", "point": "bottomLeft"},
      "to": {"shape": "canvas", "point": "topRight"},
      "fill": ["'aliceblue'"],
      "isGuide": false
    },
    {
      "id": "scale1",
      "type": "modify.scale",
      "shape": "shape_rect1",
      "point": "right",
      "prop": "width",
      "by": [{"variable": "barWidth"}],
      "__COMMENT": "Should we able to scale to points? Should there a better way to differentiate between points and expressions here?",
      "__COMMENT1": "Currently distguishing this based on whether 'to' is is an object with .shape and .point",
      "__COMMENT2": "We will adopt the convention the that .to means absolute and .by is relative"
    },
    {
      "id": "loop1",
      "type": "flow.loop",
      "instructions": [
        {
          "id": "rect2",
          "type": "draw.rect",
          "from": {"shape": "shape_rect1", "point": "bottomLeft"},
          "to": {"shape": "shape_rect1", "point": "topRight"},
          "fill": [{"variable": "bar_color"}]
        },
        {
          "id": "scale2",
          "type": "modify.scale",
          "shape": "shape_rect2",
          "point": "top",
          "prop": "height",
          "by": [{"variable": "norm_energy_in_mwh"}]
        },
        {
          "id": "move1",
          "type": "modify.move",
          "shape": "shape_rect1",
          "point": "bottomLeft",
          "to": {"shape": "shape_rect2", "point": "bottomRight"},
          "__COMMENT": "note that the use of .to here means an absolute move"
        },
        {
          "id": "text1",
          "type": "draw.text",
          "from": {"shape": "shape_rect2", "point": "topLeft"},
          "to": {"shape": "shape_rect2", "point": "topRight"},
          "text": [{"variable": "energy_in_mwh"}],
          "fontSize": ["13"]
        },
        {
          "id": "move2",
          "type": "modify.move",
          "shape": "shape_text2",
          "point": "center",
          "by": {"x": ["0"], "y": ["14"]},
          "__COMMENT": "note that the use of .by here means a relative move",
          "__COMMENT1": "had we used .to here, this would be interpreted as move to the absolute coordinates (0, 14)"
        }
      ]
    }
  ]
};

export default barsImmutable;
