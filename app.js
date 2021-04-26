//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const {day} = require('./day.js')
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://user:user123@cluster0.8f30j.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your Todo List",
});

const item2 = new Item({
  name: "Hit the + button to add new item",
});
const item3 = new Item({
  name: "Hit the checkbox to delete item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved items to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day(), newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newName;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === day()) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName}, (err,foundList)=>{
      foundList.items.push(item)
      foundList.save()
      res.redirect('/'+ listName)
    })
  }
});

app.post("/delete", (req, res) => {
  const checkedItemID = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemID, (err) => {
    if (!err) {
      console.log("Successfully deleted item");
      res.redirect("/");
    } else {
      console.log(err);
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = req.params.customListName;

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

let port = process.env.PORT;
if(port== null || port ==""){
  port=3000;
}


app.listen(port, function () {
  console.log(`Server Has Started on Port ${port}! `);
});
