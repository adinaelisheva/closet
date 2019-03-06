<?php 
  include("init.php");
  echo('[');
  $result = mysqli_query($con,"SELECT * from clothes ORDER BY location, type;");
  $first = true;
  while($result && $row = mysqli_fetch_array($result)){
    if ($first) {
      $first = false;
    } else {
      echo(',');
    }
    echo('{"name":"');
    echo($row['name']);
    echo('","id":"');
    echo($row['id']);
    echo('","type":"');
    echo($row['type']);
    echo('","location":"');
    echo($row['location']);
    echo('"}');
  }
  echo(']');
?>