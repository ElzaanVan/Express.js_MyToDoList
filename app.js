//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");
const capitalize = require("lodash.capitalize");
const getGoogleFonts = require ("get-google-fonts");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Elzaan_01:Elzaan123@cluster0.shh6b.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, {
  useFindAndModify: false
});


const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const itemOne = new Item({
  name: "Write essay"
});
const itemTwo = new Item({
  name: "Vaccinate dog"
});
const itemThree = new Item({
  name: "Remember Catnip"
});

const defaultItems = [itemOne, itemTwo, itemThree];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success with items!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function(err) {
      if (!err) {
        console.log("success with deleting checked item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemID
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
});



app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list
        res.render("list.ejs", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});
let port = process.env.PORT;
if(port == null || port ==""){
  port = 3000
}



app.listen(port, function() {
  console.log("Server started successfully");
});
