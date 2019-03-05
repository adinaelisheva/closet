<?php

include("init.php");

if(isset($_GET['id']) && isset($_GET['location'])){
  $location = mysqli_real_escape_string($con,$_GET['location']);
  $id = mysqli_real_escape_string($con,$_GET['id']);
  $str = "UPDATE clothes SET location = '$location' WHERE id = $id;";

  if(!mysqli_query($con,$str)){
    $err = mysqli_error($con);
    echo($err);
  }
      
}
?>